import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { register, registerDriver } from '../services/api';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ position, setPosition }) {
  const defaultPosition = [12.3456, 78.9012];

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return (
    <Marker position={position || defaultPosition} />
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'user',
    vehicleType: '',
    location: null,
    isAvailable: true,
    status: 'idle'
  });
  const navigate = useNavigate();

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
            location: formData.location ? [formData.location.lng, formData.location.lat] : undefined,
            isAvailable: formData.isAvailable,
            status: formData.status
          };
      
      const response = await registerFunction(registrationData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', formData.userType);
      navigate(formData.userType === 'user' ? '/create-booking' : '/driver-dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
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
              <MapContainer center={[12.3456, 78.9012]} zoom={13} style={{ height: '300px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={formData.location} setPosition={(pos) => setFormData({...formData, location: pos})} />
              </MapContainer>
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