import React, { useState } from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import CreateBooking from './CreateBooking';
import ViewBookings from './ViewBookings';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const switchToViewBookings = () => {
    setValue(1);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="user dashboard tabs">
            <Tab label="Create Booking" />
            <Tab label="View Bookings" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <CreateBooking onBookingCreated={switchToViewBookings} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ViewBookings />
        </TabPanel>
      </Box>
    </Container>
  );
}
