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
  // location: { type: [Number], index: '2dsphere' },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: { type: String, enum: ['idle', 'en-route'], default: 'idle' },
  aggregateRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
});

DriverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);