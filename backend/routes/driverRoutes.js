const express = require('express');
const { acceptJob, updateLocation } = require('../controllers/driverController');
const router = express.Router();

router.post('/accept-job', acceptJob);
router.post('/update-location', updateLocation);

module.exports = router;
