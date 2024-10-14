const cron = require('node-cron');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

const updateDriverRatings = async () => {
  try {
    const drivers = await Driver.find();

    for (const driver of drivers) {
      const bookings = await Booking.find({ driverId: driver._id, rating: { $ne: null } });
      
      if (bookings.length > 0) {
        const totalRating = bookings.reduce((sum, booking) => sum + booking.rating, 0);
        const averageRating = totalRating / bookings.length;

        driver.aggregateRating = averageRating;
        driver.totalRatings = bookings.length;
        await driver.save();
      }
    }

    console.log('Driver ratings updated successfully');
  } catch (error) {
    console.error('Error updating driver ratings:', error);
  }
};

// Schedule the job to run every 24 hours
cron.schedule('0 0 * * *', updateDriverRatings);

module.exports = updateDriverRatings;