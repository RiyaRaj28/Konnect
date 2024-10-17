import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { createBooking } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return <Marker position={position} icon={DefaultIcon} />;
}

export default function CreateBooking({ onBookingCreated }) {
  const [pickupLocation, setPickupLocation] = useState({ lat: 29.9456, lng: 76.8131 });
  const [dropoffLocation, setDropoffLocation] = useState({ lat: 29.9456, lng: 76.8131 });
  const [vehicleType, setVehicleType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking({
        pickupLocation: [pickupLocation.lng, pickupLocation.lat],
        dropoffLocation: [dropoffLocation.lng, dropoffLocation.lat],
        vehicleType,
      });
      // Clear the form
      setPickupLocation('');
      setDropoffLocation('');
      setVehicleType('');
      // Call the onBookingCreated function to switch to the View Bookings tab
      onBookingCreated();
    } catch (error) {
      console.error('Booking creation failed:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" variant="h5">
        Create Booking
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <Typography>Select Pickup Location</Typography>
        <MapContainer center={[pickupLocation.lat, pickupLocation.lng]} zoom={13} style={{ height: '300px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={pickupLocation} setPosition={setPickupLocation} />
        </MapContainer>
        <Typography sx={{ mt: 2 }}>Select Dropoff Location</Typography>
        <MapContainer center={[dropoffLocation.lat, dropoffLocation.lng]} zoom={13} style={{ height: '300px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={dropoffLocation} setPosition={setDropoffLocation} />
        </MapContainer>
        <TextField
          margin="normal"
          required
          fullWidth
          id="vehicleType"
          label="Vehicle Type"
          name="vehicleType"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={!pickupLocation || !dropoffLocation || !vehicleType}
        >
          Create Booking
        </Button>
      </Box>
    </Box>
  );
}
