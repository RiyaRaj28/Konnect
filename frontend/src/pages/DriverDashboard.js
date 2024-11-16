import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, Button, CircularProgress, Tabs, Tab, Chip } from '@mui/material';
import { getPendingBookings, getTotalEarning, acceptJob, updateBookingStatus, getDriverStatus, getAcceptedBookings, updateLiveLocation, getBookingDetails } from '../services/api';

export default function DriverDashboard() {
  const [bookings, setBookings] = useState({ pending: [], accepted: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [driverStatus, setDriverStatus] = useState('idle'); 
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, earningsResponse, statusResponse, acceptedBookingsResponse] = await Promise.all([
        getPendingBookings(),
        getTotalEarning(),
        getDriverStatus(),
        getAcceptedBookings()
      ]);

      // console.log('Pending Response:', pendingResponse);
      // console.log('Earnings Response:', earningsResponse);
      // console.log('Status Response of driver:', statusResponse);


      if (pendingResponse && earningsResponse  && statusResponse) {
        // All pending bookings are considered 'pending' in this response
      // console.log('Pending Response2:', pendingResponse.data);
        setBookings({
          pending: pendingResponse.data,
          // accepted: pendingResponse.data.filter(booking => booking.status === 'accepted'),
          accepted: acceptedBookingsResponse.data, // We don't have accepted bookings in this response
          completed: earningsResponse.data // Completed bookings are in the earnings response
        });
        setTotalEarnings(earningsResponse.data.totalEarnings);

        setAcceptedBookings(acceptedBookingsResponse.data);
      // console.log('Earnings Response2:', earningsResponse.data.data);
      // console.log('Earnings Response2:', earningsResponse.data.totalEarnings);

      

        setDriverStatus(statusResponse.data.status);
      // console.log('Status Response2222:', statusResponse.data.status);


      } else {
        setError('Failed to fetch dataaaa');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (bookingId) => {
    try {
      await acceptJob(bookingId);
      console.log("AAAAAAA", bookingId);
      console.log('Booking ID from handle accept job I have accepted:', bookingId);
      startLocationTracking(bookingId);
      await fetchData();
    } catch (error) {
      console.error('Error accepting job:', error);
      setError('Failed to accept job');
    }
  };

  const startLocationTracking = (bookingId) => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`New position - Lat: ${latitude}, Lon: ${longitude}, Accuracy: ${accuracy} meters`);
          updateLiveLocation(latitude, longitude, bookingId);
        },
        (error) => console.error('Error getting location:', error),
        { 
          enableHighAccuracy: true, 
          maximumAge: 30000,     // Don't use cached positions
          timeout: 27000      // Wait up to 5 seconds for a position
        }
      );
      console.log('Watch ID:', watchId);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const fallbackLocationMethod = (bookingId) => {
    // This could be an IP-based geolocation service or any other method
    // For demonstration, we'll use a fixed position
    const fallbackLatitude = 0;
    const fallbackLongitude = 0;
    updateLiveLocation(fallbackLatitude, fallbackLongitude, bookingId);
  };

  console.log('Accepted Bookings:', acceptedBookings);
  // console.log("bookingid", bookingd);
  // console.log("status",); 

  const handleBookingStatus = async (bookingId, status) => {
    try {
      console.log('Booking ID from update status:', bookingId);
      console.log('Status:', status);
      await updateBookingStatus(bookingId, status);
      await fetchData();
      console.log('Booking ID from update status:', bookingId);
      console.log('Status:', status);

    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" color="error">
            {error}
          </Typography>
          <Button onClick={fetchData} variant="contained" sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  console.log('Bookings???:', bookings);
  // console.log("statsuatasu", driverStatus.data.status);

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Driver Dashboard
        </Typography>
        {typeof driverStatus === 'string' ? (
      <Chip
        label={`Status: ${driverStatus.charAt(0).toUpperCase() + driverStatus.slice(1)}`}
        color={driverStatus === 'idle' ? 'success' : 'warning'}
        sx={{ mb: 2 }}
      />
    ) : (
      <Chip label="Status: Unknown" color="error" sx={{ mb: 2 }} />
    )}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label={`Pending Bookings (${bookings.pending.data.length})`} />
          <Tab label={`Accepted Bookings (${bookings.accepted.data.length})`} />
          <Tab label={`Completed Bookings (${bookings.completed.data.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
              Pending Bookings
            </Typography>
            {bookings.pending.length === 0 ? (
              <Typography>No pending bookings</Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {bookings.pending.data.map((booking) => (
                  <ListItem key={booking.id} alignItems="flex-start">
                    <ListItemText
                      primary={`Booking ID: ${booking.id}`}
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
                          <br />
                          {`User: ${booking.userName} (${booking.userEmail})`}
                        </React.Fragment>
                      }
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptJob(booking.id)}
                      disabled={driverStatus !== 'idle'}
                    >
                      Accept Job
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
              Accepted Bookings
            </Typography>
            {bookings.accepted.length === 0 ? (
              <Typography>No accepted bookings</Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {bookings.accepted.data.map((booking) => (
                  <ListItem key={booking.id} alignItems="flex-start">
                    <ListItemText
                      primary={`Booking ID: ${booking.id}`}
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
                      color="secondary"
                      onClick={() => handleBookingStatus(booking.id, 'completed')}
                    >
                      Complete
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {activeTab === 2 && (
          <>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
              Completed Bookings
            </Typography>
            <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
              Total Earnings: ${(totalEarnings || 0).toFixed(2)}
            </Typography>
            {bookings.completed.length === 0 ? (
              <Typography>No completed bookings</Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {bookings.completed.data.map((booking) => (
                  <ListItem key={booking._id} alignItems="flex-start">
                    <ListItemText
                      primary={`Booking ID: ${booking._id}`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            Client Name: {booking.userName}
                          </Typography>
                          <br />
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
                          <br />
                          {`Rating: ${booking.rating}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
