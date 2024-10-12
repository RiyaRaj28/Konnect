const express = require('express');
const { getDriverStats } = require('../controllers/adminController');
const router = express.Router();

router.get('/stats/drivers', getDriverStats);

module.exports = router;
