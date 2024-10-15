const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getTotalBookings = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const allBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('driverId', 'name email vehicleType')
      .select('-__v');
    res.status(200).json({ totalBookings, allBookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total bookings', error: error.message });
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('driverId', 'name email vehicleType')
      .select('-__v');
    res.status(200).json({ count: pendingBookings.length, pendingBookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending bookings', error: error.message });
  }
};

exports.getAcceptedBookings = async (req, res) => {
  try {
    const acceptedBookings = await Booking.find({ status: 'accepted' })
      .populate('userId', 'name email')
      .populate('driverId', 'name email vehicleType')
      .select('-__v');
    res.status(200).json({ count: acceptedBookings.length, acceptedBookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accepted bookings', error: error.message });
  }
};

exports.getCompletedBookings = async (req, res) => {
  try {
    const completedBookings = await Booking.find({ status: 'completed' })
      .populate('userId', 'name email')
      .populate('driverId', 'name email vehicleType')
      .select('-__v');
    res.status(200).json({ count: completedBookings.length, completedBookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching completed bookings', error: error.message });
  }
};

exports.getTotalDrivers = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const drivers = await Driver.find().select('-password -__v');
    res.status(200).json({ totalDrivers, drivers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total drivers', error: error.message });
  }
};

exports.getIdleDrivers = async (req, res) => {
  try {
    const idleDrivers = await Driver.find({ status: 'idle', isAvailable: true })
      .select('-password -__v');
    res.status(200).json({ count: idleDrivers.length, idleDrivers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching idle drivers', error: error.message });
  }
};

exports.getEnRouteDrivers = async (req, res) => {
  try {
    const enRouteDrivers = await Driver.find({ status: 'en-route' })
      .select('-password -__v');
    res.status(200).json({ count: enRouteDrivers.length, enRouteDrivers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching en-route drivers', error: error.message });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const users = await User.find({ role: 'user' }).select('-password -__v');
    res.status(200).json({ totalUsers, users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total users', error: error.message });
  }
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
  console.log("req.user:", req.user);
  console.log("req.user.role:", req.user ? req.user.role : 'undefined');
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};