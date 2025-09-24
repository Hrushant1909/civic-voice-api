const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user location
router.put('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude, address, city, state } = req.body;
    
    await User.findByIdAndUpdate(req.user.userId, {
      location: { latitude, longitude, address, city, state }
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
