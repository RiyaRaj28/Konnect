const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

exports.acceptJob = async (req, res) => {
  const { driverId, bookingId } = req.body;

  try {
    const driver = await Driver.findById(driverId);
    if (!driver.isAvailable) return res.status(400).json({ message: 'Driver not available' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'accepted';
    driver.status = 'en-route';
    driver.isAvailable = false;

    await booking.save();
    await driver.save();

    res.status(200).json({ message: 'Job accepted', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting job', error });
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
