import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import { getBookingDetails, getDriverById } from '../services/api';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingData = await getBookingDetails(bookingId);
        // console.log('Booking details from getBookingDetails api:', bookingData.data.booking);
        setBooking(bookingData.data.booking);  // Set the booking data directly
        // console.log("BOOKING DATA FROM BOOKING DETAILS", bookingData)
        
        if (bookingData.driverId) {
          const driverData = await getDriverById(bookingData.driverId);
          // console.log("Driver data from getDriverById:", driverData);
          setDriver(driverData);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  // console.log("BOOKINGgggg", booking)
  // console.log("DRIVER", booking.driver)
  
  // console.log("PICKUP", booking.pickupLocation)
  // console.log("DROPOFF", booking.dropoffLocation)

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Booking Details</h1>
      <p>Booking ID: {booking._id}</p>
      <p>Status: {booking.status}</p>
      <p>Pickup: {booking.pickupLocation.join(', ')}</p>
      <p>Dropoff: {booking.dropoffLocation.join(', ')}</p>
      <p>Vehicle Type: {booking.vehicleType}</p>
      <p>Estimated Price: ${booking.estimatedPrice}</p>
      {driver && (
        <p>Driver: {driver.name} ({driver.vehicleType})</p>
      )}
      {booking.status === 'accepted' && (
        <>
          <h2>Live Tracking</h2>
          <LiveTracking 
            bookingId={booking._id} 
            pickup={booking.pickupLocation}
            dropoff={booking.dropoffLocation}
          />
        </>
      )}
    </div>
  );
};

export default BookingDetails;
