// const mongoose = require('mongoose');

// const DriverSchema = new mongoose.Schema({
//   name: String,
//   vehicleType: String,
//   isAvailable: { type: Boolean, default: true },
//   location: { type: [Number], index: '2dsphere' },
//   status: { type: String, enum: ['idle', 'en-route', 'delivering'], default: 'idle' }
// });

// module.exports = mongoose.model('Driver', DriverSchema);

const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
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
  status: { type: String, enum: ['idle', 'en-route', 'delivering'], default: 'idle' }
});

// Create 2dsphere index for location
DriverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
