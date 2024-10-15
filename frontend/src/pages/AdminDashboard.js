import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import {
  getTotalDrivers,
  getIdleDrivers,
  getEnRouteDrivers,
  getTotalBookings,
  getPendingBookingsAdmin,
  getAcceptedBookingsAdmin,
  getCompletedBookings,
  getTotalUsers
} from '../services/api';

const AdminDashboard = () => {
  const [value, setValue] = useState(0);
  const [driversValue, setDriversValue] = useState(0);
  const [bookingsValue, setBookingsValue] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState([]);
  const [idleDrivers, setIdleDrivers] = useState([]);
  const [enRouteDrivers, setEnRouteDrivers] = useState([]);
  const [totalBookings, setTotalBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        totalDriversRes,
        idleDriversRes,
        enRouteDriversRes,
        totalBookingsRes,
        pendingBookingsRes,
        acceptedBookingsRes,
        completedBookingsRes,
        usersRes
      ] = await Promise.all([
        getTotalDrivers(),
        getIdleDrivers(),
        getEnRouteDrivers(),
        getTotalBookings(),
        getPendingBookingsAdmin(),
        getAcceptedBookingsAdmin(),
        getCompletedBookings(),
        getTotalUsers()
      ]);

      setTotalDrivers(totalDriversRes.data.drivers);
      setIdleDrivers(idleDriversRes.data.idleDrivers);
      setEnRouteDrivers(enRouteDriversRes.data.enRouteDrivers);
      setTotalBookings(totalBookingsRes.data.allBookings);
      setPendingBookings(pendingBookingsRes.data.pendingBookings);
      setAcceptedBookings(acceptedBookingsRes.data.acceptedBookings);
      setCompletedBookings(completedBookingsRes.data.completedBookings);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDriversChange = (event, newValue) => {
    setDriversValue(newValue);
  };

  const handleBookingsChange = (event, newValue) => {
    setBookingsValue(newValue);
  };

  const renderDriversTable = (drivers) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Vehicle Type</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver._id}>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.vehicleType}</TableCell>
              <TableCell>{driver.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderBookingsTable = (bookings) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Pick-up</TableCell>
            <TableCell>Drop-off</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell>{booking.userId.name}</TableCell>
              <TableCell>{booking.driverId ? booking.driverId.name : 'N/A'}</TableCell>
              <TableCell>{booking.status}</TableCell>
              <TableCell>{booking.pickupLocation}</TableCell>
              <TableCell>{booking.dropoffLocation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUsersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Drivers" />
        <Tab label="Bookings" />
        <Tab label="Users" />
      </Tabs>
      {value === 0 && (
        <div>
          <Tabs value={driversValue} onChange={handleDriversChange}>
            <Tab label="Total Drivers" />
            <Tab label="Idle Drivers" />
            <Tab label="En-Route Drivers" />
          </Tabs>
          {driversValue === 0 && renderDriversTable(totalDrivers)}
          {driversValue === 1 && renderDriversTable(idleDrivers)}
          {driversValue === 2 && renderDriversTable(enRouteDrivers)}
        </div>
      )}
      {value === 1 && (
        <div>
          <Tabs value={bookingsValue} onChange={handleBookingsChange}>
            <Tab label="Total Bookings" />
            <Tab label="Pending Bookings" />
            <Tab label="Accepted Bookings" />
            <Tab label="Completed Bookings" />
          </Tabs>
          {bookingsValue === 0 && renderBookingsTable(totalBookings)}
          {bookingsValue === 1 && renderBookingsTable(pendingBookings)}
          {bookingsValue === 2 && renderBookingsTable(acceptedBookings)}
          {bookingsValue === 3 && renderBookingsTable(completedBookings)}
        </div>
      )}
      {value === 2 && renderUsersTable()}
    </div>
  );
};

export default AdminDashboard;
