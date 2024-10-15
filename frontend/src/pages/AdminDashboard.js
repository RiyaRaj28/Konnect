import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Card, CardContent, Grid } from '@mui/material';
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

  const renderSummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Drivers</Typography>
            <Typography variant="h4">{totalDrivers.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Idle Drivers</Typography>
            <Typography variant="h4">{idleDrivers.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">En-Route Drivers</Typography>
            <Typography variant="h4">{enRouteDrivers.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{users.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBookingSummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Bookings</Typography>
            <Typography variant="h4">{totalBookings.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Pending Bookings</Typography>
            <Typography variant="h4">{pendingBookings.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Accepted Bookings</Typography>
            <Typography variant="h4">{acceptedBookings.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Completed Bookings</Typography>
            <Typography variant="h4">{completedBookings.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {renderSummaryCards()}
      <Tabs value={value} onChange={handleChange} sx={{ mb: 2 }}>
        <Tab label="Drivers" />
        <Tab label="Bookings" />
        <Tab label="Users" />
      </Tabs>
      {value === 0 && (
        <div>
          <Tabs value={driversValue} onChange={handleDriversChange} sx={{ mb: 2 }}>
            <Tab label={`Total Drivers (${totalDrivers.length})`} />
            <Tab label={`Idle Drivers (${idleDrivers.length})`} />
            <Tab label={`En-Route Drivers (${enRouteDrivers.length})`} />
          </Tabs>
          {driversValue === 0 && renderDriversTable(totalDrivers)}
          {driversValue === 1 && renderDriversTable(idleDrivers)}
          {driversValue === 2 && renderDriversTable(enRouteDrivers)}
        </div>
      )}
      {value === 1 && (
        <div>
          {renderBookingSummaryCards()}
          <Tabs value={bookingsValue} onChange={handleBookingsChange} sx={{ mb: 2 }}>
            <Tab label={`Total Bookings (${totalBookings.length})`} />
            <Tab label={`Pending Bookings (${pendingBookings.length})`} />
            <Tab label={`Accepted Bookings (${acceptedBookings.length})`} />
            <Tab label={`Completed Bookings (${completedBookings.length})`} />
          </Tabs>
          {bookingsValue === 0 && renderBookingsTable(totalBookings)}
          {bookingsValue === 1 && renderBookingsTable(pendingBookings)}
          {bookingsValue === 2 && renderBookingsTable(acceptedBookings)}
          {bookingsValue === 3 && renderBookingsTable(completedBookings)}
        </div>
      )}
      {value === 2 && (
        <div>
          <Typography variant="h6" gutterBottom>
            Total Users: {users.length}
          </Typography>
          {renderUsersTable()}
        </div>
      )}
    </Box>
  );
};

export default AdminDashboard;
