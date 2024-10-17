const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { emitDriverLocation } = require('../services/socketService');
const cacheService = require('../services/cacheService');

// Register a new driver
exports.getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;
    const cacheKey = `driver:${driverId}`;

    // Try to get driver from cache
    let driver = await cacheService.get(cacheKey);
    console.log("DRIVER FROM CACHE", driver)

    if (!driver) {
      // If not in cache, get from database
      driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      // Store in cache
      await cacheService.set(cacheKey, driver);
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver', error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const updateData = req.body;
    const cacheKey = `driver:${driverId}`;

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    console.log("UPDATED DRIVER FROM CACHE", updatedDriver)

    // Update cache
    await cacheService.set(cacheKey, updatedDriver);

    res.json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: 'Error updating driver', error: error.message });
  }
};

exports.registerDriver = async (req, res) => {
  const { name, vehicleType, isAvailable, email, password, location, status } = req.body;

  try {
    // Check if driver already exists
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the location object
    const driverLocation = {
      type: 'Point',
      coordinates: location && Array.isArray(location) ? location : [0, 0] // Default to [0, 0] if not provided
    };

    console.log("driverLocation", driverLocation) 

    // Create a new driver
    const newDriver = new Driver({
      name,
      vehicleType,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      email,
      password: hashedPassword,
      location: location || { type: 'Point', coordinates: [0, 0] }, // Use provided location or default
      status: status || 'idle',
      aggregateRating: 0,
      totalRatings: 0
    });

    await newDriver.save();
    
    // Generate JWT token
    const token = jwt.sign({id: newDriver._id, type: 'driver'}, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ message: 'Driver registered successfully', token });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ message: 'Error registering driver', error: error.message });
  }
};

exports.loginDriver = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the driver by email
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({id: driver._id, type: 'driver'}, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in driver:', error);
    res.status(500).json({ message: 'Error logging in driver', error: error.message });
  }
};

exports.acceptJob = async (req, res) => {
  const { bookingId } = req.body;
  const trimmedBookingId = bookingId.trim(); // Trim any whitespace

  try {
    if (!req.driver) {
      return res.status(401).json({ message: 'Not authorized, no driver found in request' });
    }

    const driverId = req.driver._id;

    // Check if driverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }

    // First, find the driver without updating
    const driver = await Driver.findById(driverId);
    console.log('Driver:', driver); 

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found in database' });
    }

    if (!driver.isAvailable) {
      return res.status(400).json({ message: 'Driver is not available' });
    }

    // Now update the driver
    const updatedDriver = await Driver.findOneAndUpdate(
      { _id: driverId, isAvailable: true },
      { $set: { status: 'en-route', isAvailable: false } },
      { new: true, runValidators: true }
    );

    console.log('Updated driver avl?:', updatedDriver.isAvailable);

    if (!updatedDriver) {
      return res.status(400).json({ message: 'Failed to update driver status' });
    }

    // Check if booking exists before updating
    const existingBooking = await Booking.findById(trimmedBookingId);
    if (!existingBooking) {
      // Revert driver status
      await Driver.findByIdAndUpdate(driverId, { status: 'idle', isAvailable: true });
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (existingBooking.status !== 'pending') {
      // Revert driver status
      await Driver.findByIdAndUpdate(driverId, { status: 'idle', isAvailable: true });
      return res.status(400).json({ message: 'Booking is not in pending status' });
    }

    // Update the booking with start time
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: trimmedBookingId, status: 'pending' },
      { 
        $set: { 
          status: 'accepted', 
          driverId: driverId,
          startTime: new Date() // Add start time
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      // Revert driver status
      await Driver.findByIdAndUpdate(driverId, { status: 'idle', isAvailable: true });
      return res.status(400).json({ message: 'Failed to update booking' });
    }

    res.status(200).json({ 
      message: 'Job accepted', 
      booking: updatedBooking,
      driver: {
        id: updatedDriver._id,
        status: updatedDriver.status,
        isAvailable: updatedDriver.isAvailable
      }
    });
  } catch (error) {
    console.error('Error accepting job:', error);
    res.status(500).json({ message: 'Error accepting job', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  const { driverId, location } = req.body;

  try {
    await Driver.findByIdAndUpdate(driverId, { location });
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error });
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const driverId = req.driver._id;

    // Find all bookings assigned to this driver with 'pending' status
    const pendingBookings = await Booking.find({
      driverId: driverId,
      status: 'pending'
    }).populate('userId', 'name email');

    // Format the response data
    const formattedBookings = pendingBookings.map(booking => ({
      id: booking._id,
      userName: booking.userId.name,
      userEmail: booking.userId.email,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      vehicleType: booking.vehicleType,
      estimatedPrice: booking.estimatedPrice,
      createdAt: booking.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending bookings',
      error: error.message
    });
  }
};

exports.getTotalEarning = async (req, res) => {
  try {
    const driverId = req.driver._id; // Assuming you have middleware to set req.driver

    const completedBookings = await Booking.find({
      driverId: driverId,
      status: 'completed'
    }).populate('userId', 'name').sort({ completedAt: -1 });

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.estimatedPrice, 0);

    const formattedBookings = completedBookings.map(booking => ({
      ...booking.toObject(),
      userName: booking.userId.name
    }));

    res.json({
      success: true,
      data: formattedBookings,
      totalEarnings: totalEarnings
    });
  } catch (error) {
    console.error('Error fetching completed bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed bookings',
      error: error.message
    });
  }
};

exports.getDriverStatus = async (req, res) => {
  try {
    const driverId = req.driver.id; // Extract driverId from token (attached by the auth middleware)

    // Find the driver by ID
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Return the driver's status
    res.status(200).json({ success: true, status: driver.status });
  } catch (error) {
    console.error('Error fetching driver status:', error);
    res.status(500).json({ success: false, message: 'Error fetching driver status', error: error.message });
  }
};

exports.getAcceptedBookings = async (req, res) => {
  try {
    const driverId = req.driver._id;

    // Find all bookings assigned to this driver with 'accepted' status
    const acceptedBookings = await Booking.find({
      driverId: driverId,
      status: 'accepted'
    }).populate('userId', 'name email');

    // Format the response data
    const formattedBookings = acceptedBookings.map(booking => ({
      id: booking._id,
      userName: booking.userId.name,
      userEmail: booking.userId.email,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      vehicleType: booking.vehicleType,
      estimatedPrice: booking.estimatedPrice,
      createdAt: booking.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching accepted bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accepted bookings',
      error: error.message
    });
  }
};

exports.updateLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude, bookingId } = req.body;
    const driverId = req.driver._id;

    // Update driver's location in the database
    await Driver.findByIdAndUpdate(driverId, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    // Emit the updated location to connected clients
    emitDriverLocation(bookingId, { latitude, longitude });
    console.log("LOCATION UPDATED")

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating live location:', error);
    res.status(500).json({ message: 'Error updating live location', error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;
    const cacheKey = `driver:${driverId}`;

    // Try to get driver from cache
    let driver = await cacheService.get(cacheKey);
    console.log("DRIVER FROM CACHE", driver)

    if (!driver) {
      // If not in cache, get from database
      driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      // Store in cache
      await cacheService.set(cacheKey, driver);
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver', error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const updateData = req.body;
    const cacheKey = `driver:${driverId}`;

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update cache
    await cacheService.set(cacheKey, updatedDriver);

    res.json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: 'Error updating driver', error: error.message });
  }
};
