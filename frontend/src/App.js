import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateBooking from './pages/CreateBooking';
import ViewBookings from './pages/ViewBookings';
import  DriverDashboard from './pages/DriverDashboard';
import UpdateBookingStatus from './pages/UpdateBookingStatus';
import AdminDashboard from './pages/AdminDashboard';
// import PendingBookings from './pages/PendingBookings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-booking" element={<CreateBooking />} />
        <Route path="/view-bookings" element={<ViewBookings />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} /> 
        <Route path="/update-booking-status" element={<UpdateBookingStatus />} />
        <Route path="/" element={<Navigate to="/login" replace />} /> 
      </Routes>
    </Router>
  );
}

export default App;