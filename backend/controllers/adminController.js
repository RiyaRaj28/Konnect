const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

// exports.getDriverStats = async (req, res) => {
//   try {
//     const activeDrivers = await Driver.countDocuments({ isAvailable: true });
//     const totalTrips = await Booking.countDocuments({ status: 'completed' });
    
//     res.status(200).json({ activeDrivers, totalTrips });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching driver stats', error });
//   }
// };

exports.getDriverStats = async (req, res) => {
  try {
    const activeDrivers = await Driver.countDocuments({ isAvailable: true });
    const totalDrivers = await Driver.countDocuments();
    const totalTrips = await Booking.countDocuments({ status: 'completed' });
    // const averageRating = await Driver.aggregate([
    //   { $match: { rating: { $exists: true } } },
    //   { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    // ]);

    const stats = {
      activeDrivers,
      totalDrivers,
      totalTrips,
      // averageDriverRating: averageRating[0]?.avgRating || 0
    };

    // logger.info('Driver stats fetched successfully');
    res.status(200).json(stats);
  } catch (error) {
    // logger.error('Error fetching driver stats:', error);
    res.status(500).json({ message: 'Error fetching driver stats', error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const activeBookings = await Booking.countDocuments({ status: 'accepted' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email')
      .populate('driverId', 'name vehicleType')
      .select('-__v');

    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$estimatedPrice' } } }
    ]);

    const stats = {
      activeBookings,
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentBookings
    };

    // logger.info('Admin stats fetched successfully');
    res.status(200).json(stats);
  } catch (error) {
    // logger.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};

// Add this function to your adminController.js or a similar controller file

exports.getAllActiveBookings = async (req, res) => {
  try {
    const activeBookings = await Booking.find({ status: 'accepted' })
      .populate('userId', 'name email')
      .populate('driverId', 'name vehicleType')
      .select('-__v');

    res.status(200).json(activeBookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active bookings', error: error.message });
  }
};