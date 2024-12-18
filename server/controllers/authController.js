const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  const { name, identifier, password } = req.body;

  try {
    console.log("Im in backend try block 1");
    console.log(identifier);

    // Check if the identifier is neither an email nor a phone number
    if (!identifier || (identifier && !identifier.includes('@') && identifier.length < 10)) {
      return res.status(400).json({ message: 'Invalid email or phone number' });
    }

    // Check if a user already exists with the given identifier (email or phone)
    const userExists = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    console.log("Im in backend try block 2");
    console.log(userExists);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Initialize variables for email and phone
    let email = null;
    let phone = null;

    
    email = identifier;
    phone = identifier;
    

    // Ensure that at least one of email or phone is provided and not null
    if (!email && !phone) {
      return res.status(400).json({ message: 'Either email or phone number is required' });
    }

    // Create user with either email or phone, but not both or null
    const user = await User.create({
      name,
      email,  // Will be null if it's a phone number
      phone,  // Will be null if it's an email
      password
    });

    console.log("Creating New User");
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      console.log("User not created");
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log(error.message);  // Log the error for better debugging
    res.status(500).json({ message: error.message });
  }
};






const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Find user by either email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    console.log(user.id)
    // Return user details and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { signup, login };
