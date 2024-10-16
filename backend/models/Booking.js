const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: { type: [Number], index: '2dsphere' },
  dropoffLocation: { type: [Number], index: '2dsphere' },
  vehicleType: String,
  status: { type: String, enum: ['pending', 'accepted','completed'], default: 'pending' },
  estimatedPrice: Number,
  rating: { type: Number, min: 1, max: 5, default: null },
  createdAt: { type: Date, default: Date.now },
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number }, // Duration in milliseconds
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
});

// BookingSchema.pre('save', function(next) {
//   if (this.isModified('status')) {
//     if (this.status === 'accepted') {
//       this.startTime = new Date();
//     } else if (this.status === 'completed') {
//       this.endTime = new Date();
//       if (this.startTime) {
//         this.totalTime = Math.round((this.endTime - this.startTime) / 60000); // Convert milliseconds to minutes
//       }
//     }
//   }
//   next();
// });

module.exports = mongoose.model('Booking', BookingSchema);
