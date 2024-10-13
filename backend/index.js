const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./utils/database');
const { UI } = require('bullmq'); // Import BullMQ UI
console.log("uiui", UI); 
const setupBullDashboard = require('./controllers/bullDashboard');

// Routes
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
// const trackingRoutes = require('./routes/trackingRoutes');
// const pricingRoutes = require('./routes/pricingRoutes');

dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Mount BullMQ UI for queue monitoring
// app.use('/admin/queues', UI);

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/tracking', trackingRoutes);
// app.use('/api/pricing', pricingRoutes);

setupBullDashboard(app);

// Handle Errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Queue Monitoring available at http://localhost:${PORT}/admin/queues`);
});
