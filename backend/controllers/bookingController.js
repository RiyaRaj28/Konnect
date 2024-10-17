const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const { calculateBookingCost} = require('../services/bookingService');
const { queueDriverAssignment } = require('../services/PostBookingActionsQueue');
const { getDistance, getSurgeMultiplier } = require('../utils/geolocation');
const mongoose = require('mongoose');



exports.createBooking = async (req, res) => {
  const {pickupLocation, dropoffLocation, vehicleType } = req.body;

  try {
    // Step 1: Get distance and duration between pickup and dropoff locations
    const userId = req.user._id; 
    const { distanceInKilometers, durationInMinutes } = await getDistance(pickupLocation, dropoffLocation);

    // Step 2: Get surge multiplier (if any)
    const surgeMultiplier = await getSurgeMultiplier();

    // Step 3: Calculate the estimated price based on distance, duration, vehicle type, and surge pricing
    const estimatedPrice = calculateBookingCost(distanceInKilometers, durationInMinutes, vehicleType, surgeMultiplier);

    // Step 4: Create a new booking
    const booking = new Booking({
      userId,
      pickupLocation,
      dropoffLocation,
      vehicleType,
      estimatedPrice,
      distance: distanceInKilometers,
      duration: durationInMinutes,
      status: 'pending'
    });

    await booking.save();
    console.log('Booking created:', booking);

    // Step 5: Queue driver assignment job
    await queueDriverAssignment(booking._id, pickupLocation, vehicleType);

    res.status(200).json({ 
      message: 'Booking created successfully and driver assignment queued', 
      booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

exports.getBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId).populate('userId driverId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.bookingId || req.body.bookingId;
  const { status } = req.body;

  try {
    // Validate bookingId
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Current booking status:', booking.status);
    console.log('New status:', status);

    // List of valid statuses
    const validStatuses = ['pending', 'accepted', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if the booking is already completed and prevent re-completing it
    if (booking.status === 'completed' && status === 'completed') {
      return res.status(400).json({ message: 'Booking is already completed' });
    }

    // Update the status of the booking
    booking.status = status;

    // Add timing functionality
    if (status === 'accepted') {
      booking.startTime = new Date();
      console.log("Start time:", booking.startTime);
    } else if (status === 'completed') {
      booking.endTime = new Date();
      console.log("End time:", booking.endTime);
      if (booking.startTime) {
        const durationInMilliseconds = booking.endTime - booking.startTime;
        booking.duration = Math.round(durationInMilliseconds / (1000 * 60)); // Duration in minutes
        console.log("Duration in minutes:", booking.duration);
      } else {
        console.warn('Booking completed without a start time');
      }
    }

    await booking.save();

    // Update driver status based on booking status
    let updatedDriver;
    if (booking.driverId) {
      let driverUpdate = {};

      if (status === 'accepted') {
        driverUpdate = { status: 'en-route', isAvailable: false };
      } else if (status === 'completed') {
        driverUpdate = { status: 'idle', isAvailable: true };
      }

      if (Object.keys(driverUpdate).length > 0) {
        try {
          updatedDriver = await Driver.findByIdAndUpdate(
            booking.driverId,
            driverUpdate,
            { new: true, runValidators: false, select: '_id isAvailable status' }
          );
          if (!updatedDriver) {
            console.log('Driver not found:', booking.driverId);
          } else {
            console.log('Updated driver:', updatedDriver);
          }
        } catch (driverUpdateError) {
          console.error('Error updating driver:', driverUpdateError);
        }
      }
    } else {
      console.log('No driver associated with this booking');
    }

    res.status(200).json({
      message: `Booking status updated to ${status} successfully`,
      booking: {
        _id: booking._id,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration
      },
      driver: updatedDriver ? { 
        id: updatedDriver._id, 
        isAvailable: updatedDriver.isAvailable, 
        status: updatedDriver.status 
      } : null,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};


// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    // Get the userId from req.user (populated by the protect middleware)
    const userId = req.user._id;

    // Find all bookings for the given userId and populate driver details
    const bookings = await Booking.find({ userId })
      .populate('driverId', 'name vehicleType')  // Populate driver details
      .exec();  // Executes the query

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    // Return all booking details
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.rateBooking = async (req, res) => {
  console.log("ratingmjipo");
  const { bookingId, rating } = req.body;
  const userId = req.user._id;

  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, userId: userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not associated with this user' });
    }

    // Check if the booking is already rated
    if (booking.rating !== null) {
      return res.status(400).json({ message: 'This booking has already been rated' });
    }

    // Update the booking with the rating
    booking.rating = rating;
    await booking.save();

    // Update the driver's aggregate rating
    const driver = await Driver.findById(booking.driverId);
    if (driver) {
      driver.totalRatings += 1;
      driver.aggregateRating = ((driver.aggregateRating * (driver.totalRatings - 1)) + rating) / driver.totalRatings;
      await driver.save();
    }

    res.status(200).json({ message: 'Booking rated successfully', booking });
  } catch (error) {
    console.error('Error rating booking:', error);
    res.status(500).json({ message: 'Error rating booking', error: error.message });
  }
};

exports.getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')  // Populate user details
      .populate('driverId', 'name vehicleType')  // Populate driver details
      .exec();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user requesting the details is either the booking user or the assigned driver
    // if (booking.driverId && booking.driverId._id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized to view this booking' });
    // }

    res.status(200).json({
      booking: {
        _id: booking._id,
        status: booking.status,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        vehicleType: booking.vehicleType,
        estimatedPrice: booking.estimatedPrice,
        distance: booking.distance,
        duration: booking.duration,
        startTime: booking.startTime,
        endTime: booking.endTime,
        rating: booking.rating,
        user: {
          _id: booking.userId._id,
          name: booking.userId.name,
          email: booking.userId.email
        },
        driver: booking.driverId ? {
          _id: booking.driverId._id,
          name: booking.driverId.name,
          vehicleType: booking.driverId.vehicleType
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
};
