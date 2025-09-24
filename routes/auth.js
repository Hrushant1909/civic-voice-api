const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, aadharCardNo, phoneNo, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { aadharCardNo },
        { phoneNo }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, Aadhar, or phone already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      userid: Date.now().toString(),
      email: email.toLowerCase(),
      aadharCardNo,
      phoneNo,
      displayName: displayName || 'User',
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userid: user.userid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          userid: user.userid,
          email: user.email,
          displayName: user.displayName,
          phoneNo: user.phoneNo
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userid: user.userid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          userid: user.userid,
          email: user.email,
          displayName: user.displayName,
          phoneNo: user.phoneNo,
          stats: user.stats
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;
