const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

exports.getDriverStats = async (req, res) => {
  try {
    const activeDrivers = await Driver.countDocuments({ isAvailable: true });
    const totalTrips = await Booking.countDocuments({ status: 'completed' });
    
    res.status(200).json({ activeDrivers, totalTrips });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver stats', error });
  }
};
