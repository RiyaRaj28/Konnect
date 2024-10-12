const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  type: String, // Truck, Van, etc.
  capacity: Number,
  availability: { type: Boolean, default: true }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
