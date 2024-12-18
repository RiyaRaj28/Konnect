import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateBooking from './pages/CreateBooking';
import ViewBookings from './pages/ViewBookings';
import DriverDashboard from './pages/DriverDashboard';
import UpdateBookingStatus from './pages/UpdateBookingStatus';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LiveTracking from './components/LiveTracking'; // Import the new LiveTracking component
import BookingDetails from './pages/BookingDetails'; // Import the new BookingDetails component

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/view-bookings" element={<ViewBookings />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/update-booking-status" element={<UpdateBookingStatus />} />
        <Route path="/live-tracking/:bookingId" element={<LiveTracking />} /> {/* New route for live tracking */}
        <Route path="/booking/:bookingId" element={<BookingDetails />} />
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
