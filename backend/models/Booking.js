const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: { type: [Number], index: '2dsphere' },
  dropoffLocation: { type: [Number], index: '2dsphere' },
  vehicleType: String,
  status: { type: String, enum: ['pending', 'accepted','completed'], default: 'pending' },
  estimatedPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
