const express = require('express');
const { createBooking, getBooking, completeBooking, updateBookingStatus, getUserBookings } = require('../controllers/bookingController');
const { protect, authorizeUser, authorizeDriver } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book', protect, authorizeUser, createBooking);  // Protected route
router.get('/booking/:bookingId', protect, authorizeUser, getBooking); // Protected route
// router.put('/booking/:bookingId/complete', protect, completeBooking); // Protected route
router.put('/bookings/status', protect, authorizeDriver, updateBookingStatus); // Use 'protect' if authentication is required
router.get('/bookings/user', protect, authorizeUser, getUserBookings);

module.exports = router;
