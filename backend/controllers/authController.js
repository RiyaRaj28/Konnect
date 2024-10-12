const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver'); // Import the Driver model

// Function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// Register User or Driver
exports.registerUser = async (req, res) => {
  const { name, email, password, role, vehicleType, location } = req.body; // vehicleType and location for drivers

  try {
    // Check if user or driver already exists
    const existingUser = await User.findOne({ email });
    const existingDriver = await Driver.findOne({ email });

    if (existingUser || existingDriver) return res.status(400).json({ msg: 'User/Driver already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUserOrDriver;

    // Register Driver if role is 'driver'
    if (role === 'driver') {
        newUserOrDriver = new Driver({
          name,
          email,
          password: hashedPassword,
          role: 'driver',
          vehicleType,
          location: {
            type: 'Point',
            coordinates: [location.coordinates[0], location.coordinates[1]] // Longitude, Latitude
// Longitude, Latitude
          }
        });
      }
    // Register regular user or admin
    else {
      newUserOrDriver = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'user', // Default role is 'user'
      });
    }

    // Save the new user/driver to the database
    await newUserOrDriver.save();

    // Generate JWT token
    const token = generateToken(newUserOrDriver._id);

    res.status(201).json({
      _id: newUserOrDriver._id,
      name: newUserOrDriver.name,
      email: newUserOrDriver.email,
      role: newUserOrDriver.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login User or Driver
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email belongs to a user or a driver
    const user = await User.findOne({ email });
    const driver = await Driver.findOne({ email });

    const existingAccount = user || driver;

    if (!existingAccount) return res.status(400).json({ msg: 'User/Driver does not exist' });

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, existingAccount.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate a token
    const token = jwt.sign({ id: existingAccount._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        _id: existingAccount._id,
        name: existingAccount.name,
        email: existingAccount.email,
        role: existingAccount.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      // Fetch all users and drivers
      const users = await User.find({});
      const drivers = await Driver.find({});
  
      // Combine both users and drivers into one array
      const allUsers = [...users, ...drivers];
  
      res.status(200).json({
        users: allUsers,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
