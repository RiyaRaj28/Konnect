const Booking = require('../models/Booking');
const { calculateBookingCost} = require('../services/bookingService');
const { queueDriverAssignment } = require('../services/PostBookingActionsQueue');
const { getDistance, getSurgeMultiplier } = require('../utils/geolocation');

exports.createBooking = async (req, res) => {
  const { userId, pickupLocation, dropoffLocation, vehicleType } = req.body;

  try {
    // Step 1: Get distance and duration between pickup and dropoff locations
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
