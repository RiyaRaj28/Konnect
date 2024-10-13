const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  email: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true
},
  location: {
    type: {
      type: String,  // GeoJSON type, should be 'Point'
      enum: ['Point'],  // Only 'Point' type is allowed
      required: true
    },
    coordinates: {
      type: [Number],  // Array of [longitude, latitude]
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
},
  status: { type: String, enum: ['idle', 'en-route'], default: 'idle' }
});
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
      booking,
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
// Create 2dsphere index for location
DriverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
