import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { register, registerDriver } from '../services/api';
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

  return position && <Marker position={position} icon={DefaultIcon} />;
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'user',
    vehicleType: '',
    isAvailable: true,
    status: 'idle'
  });
  const [location, setLocation] = useState({ lat: 29.9456, lng: 76.8131 });
  const navigate = useNavigate();

  useEffect(() => {
    // Apply background image to the entire page
    document.body.style.backgroundImage = 'url(/bg_registration.svg)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const registerFunction = formData.userType === 'user' ? register : registerDriver;
      const registrationData = formData.userType === 'user' 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            vehicleType: formData.vehicleType,
            // location: [location.lng, location.lat],
            location: {
              type: 'Point',
              coordinates: [location.lng, location.lat]
            },
            isAvailable: formData.isAvailable,
            status: formData.status
          };
      
      // Log the data being sent to the backend
      console.log('Sending registration data to backend:', registrationData);
      
      const response = await registerFunction(registrationData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', formData.userType);
      navigate(formData.userType === 'user' ? '/user/dashboard' : '/driver-dashboard');
    } catch (error) {
      // Enhanced error logging
      console.error('Registration failed:', error.message || error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else {
        console.error('Error details:', error);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">User Type</FormLabel>
            <RadioGroup
              aria-label="user-type"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="user" control={<Radio />} label="User" />
              <FormControlLabel value="driver" control={<Radio />} label="Driver" />
            </RadioGroup>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          {formData.userType === 'driver' && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="vehicleType"
                label="Vehicle Type"
                id="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
              />
              <Typography>Select Your Location</Typography>
              <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '300px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker 
                  position={location} 
                  setPosition={setLocation} 
                />
              </MapContainer>
              {location && (
                <Typography>
                  Selected Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Typography>
              )}
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Link to="/login">
            Already have an account? Sign in
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

