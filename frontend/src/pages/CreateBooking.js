import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createBooking } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
  const [isLoading, setIsLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createBooking({
        pickupLocation: [pickupLocation.lng, pickupLocation.lat],
        dropoffLocation: [dropoffLocation.lng, dropoffLocation.lat],
        vehicleType,
      });
      setPickupLocation({ lat: 29.9456, lng: 76.8131 });
      setDropoffLocation({ lat: 29.9456, lng: 76.8131 });
      setVehicleType('');
      setOpenSuccess(true);
      onBookingCreated();
    } catch (error) {
      console.error('Booking creation failed:', error);
      setOpenError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'linear-gradient(to bottom, #f0f4f8, #d9e2ec)',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: 'lightslategray',
          borderRadius: '8px',
          boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Create Booking</h1>
        <p style={{ textAlign: 'center', color: '#555' }}>
          Click on the map to select the <strong>pickup</strong> and <strong>dropoff</strong> locations.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Pickup Location */}
            <div
              style={{
                flex: '1 1 300px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ fontSize: '18px', color: '#444', marginBottom: '10px' }}>Pickup Location</h2>
              <MapContainer
                center={[pickupLocation.lat, pickupLocation.lng]}
                zoom={13}
                style={{ height: '250px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={pickupLocation} setPosition={setPickupLocation} />
              </MapContainer>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Selected: <strong>{pickupLocation.lat.toFixed(4)}</strong>, <strong>{pickupLocation.lng.toFixed(4)}</strong>
              </p>
            </div>

            {/* Dropoff Location */}
            <div
              style={{
                flex: '1 1 300px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ fontSize: '18px', color: '#444', marginBottom: '10px' }}>Dropoff Location</h2>
              <MapContainer
                center={[dropoffLocation.lat, dropoffLocation.lng]}
                zoom={13}
                style={{ height: '250px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={dropoffLocation} setPosition={setDropoffLocation} />
              </MapContainer>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Selected: <strong>{dropoffLocation.lat.toFixed(4)}</strong>, <strong>{dropoffLocation.lng.toFixed(4)}</strong>
              </p>
            </div>
          </div>

          {/* Vehicle Type Dropdown */}
          <div style={{ marginTop: '20px' }}>
            <label
              htmlFor="vehicleType"
              style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#333'}}
            >
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' }}
              required
            >
              <option value="" disabled>
                Select a vehicle type
              </option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Van">Van</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!pickupLocation || !dropoffLocation || !vehicleType || isLoading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>

        {/* Success and Error Messages */}
        {openSuccess && (
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            Booking created successfully!
          </div>
        )}
        {openError && (
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            Booking creation failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
