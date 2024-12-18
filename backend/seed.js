const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/demo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log("Existing data cleared");

    // Seed Users
    const users = await User.insertMany([
      { name: "Alice", email: "alice@example.com", password: "password123" },
      { name: "Bob", email: "bob@example.com", password: "password123" },
    ]);
    console.log("Users seeded:", users);

    // Seed Drivers
    const drivers = await Driver.insertMany([
      {
        name: "John",
        vehicleType: "truck",
        isAvailable: true,
        email: "john@example.com",
        password: "password123",
        location: { type: "Point", coordinates: [29.9456, 76.8131] }, // Mumbai
      },
      {
        name: "Jane",
        vehicleType: "van",
        isAvailable: true,
        email: "jane@example.com",
        password: "password123",
        location: { type: "Point", coordinates: [29.9456, 76.8131] }, // Bangalore
      },
    ]);
    console.log("Drivers seeded:", drivers);

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      { type: "truck", capacity: 1000, availability: true },
      { type: "van", capacity: 500, availability: true },
    ]);
    console.log("Vehicles seeded:", vehicles);

    // Seed Bookings
    const bookings = await Booking.insertMany([
      {
        userId: users[0]._id,
        driverId: drivers[0]._id,
        pickupLocation: [29.9456, 76.8131], // Mumbai
        dropoffLocation: [29.9456, 78.8131], // Delhi
        vehicleType: "truck",
        status: "pending",
        estimatedPrice: 5000,
      },
      {
        userId: users[1]._id,
        driverId: drivers[1]._id,
        pickupLocation: [29.9456, 76.8131], // Bangalore
        dropoffLocation: [29.9456, 80.8131], // Hyderabad
        vehicleType: "van",
        status: "pending",
        estimatedPrice: 3000,
      },
    ]);
    console.log("Bookings seeded:", bookings);

    console.log("Data seeding complete!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    mongoose.disconnect();
    console.log("Database connection closed");
  }
};

seedData();
