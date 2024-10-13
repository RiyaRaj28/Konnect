const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Function to generate JWT
const generateToken = (id) => {
  return jwt.sign({id, type: 'user'}, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role} = req.body; 

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

      newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'user', // Default role is 'user'
      });
    // }

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const existingAccount = user;

    if (!existingAccount) return res.status(400).json({ msg: 'User does not exist' });

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
      const users = await User.find({});
  
      const allUsers = [...users];
  
      res.status(200).json({
        users: allUsers,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
