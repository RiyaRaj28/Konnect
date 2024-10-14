import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import { getPendingBookings, acceptJob } from '../services/api';

export default function DriverDashboard() {
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await getPendingBookings();
      setPendingBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const handleAcceptJob = async (bookingId) => {
    try {
      await acceptJob(bookingId);
      fetchPendingBookings(); // Refresh the list after accepting a job
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Pending Bookings
        </Typography>
        <List sx={{ width: '100%', mt: 2 }}>
          {pendingBookings.map((booking) => (
            <ListItem key={booking._id} alignItems="flex-start">
              <ListItemText
                primary={`Booking ID: ${booking._id}`}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Pickup: {booking.pickupLocation.join(', ')}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Dropoff: {booking.dropoffLocation.join(', ')}
                    </Typography>
                    <br />
                    {`Vehicle Type: ${booking.vehicleType}`}
                    <br />
                    {`Estimated Price: $${booking.estimatedPrice}`}
                  </React.Fragment>
                }
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAcceptJob(booking._id)}
              >
                Accept Job
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}