const express = require('express');
const { createBooking, getBooking } = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', createBooking);
router.get('/booking/:bookingId', getBooking);

module.exports = router;
