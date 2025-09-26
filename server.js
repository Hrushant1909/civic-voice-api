const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import Models
const User = require('./models/User'); // Make sure this exists
const Issue = require('./models/Issue'); // We'll create this

// Import middleware
const authenticateToken = require('./middleware/auth'); // Make sure this exists

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Civic Voice API is running!' });
});

// Issue reporting route - FIXED VERSION
app.post('/api/issues', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    
    // Validation
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category and location are required'
      });
    }

    // Validate location coordinates
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Create new issue
    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category: category,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || ''
      },
      reportedBy: req.user.userId,
      status: 'pending',
      reportedAt: new Date()
    });

    await issue.save();

    // Update user stats (optional - only if User model has stats field)
    try {
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { 'stats.totalIssuesReported': 1 }
      });
    } catch (userUpdateError) {
      console.log('User stats update failed (non-critical):', userUpdateError);
    }

    console.log(`✅ New issue reported: ${issue.title} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        issueId: issue._id,
        title: issue.title,
        category: issue.category,
        status: issue.status,
        reportedAt: issue.reportedAt
      }
    });

  } catch (error) {
    console.error('❌ Error reporting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all issues (for viewing community issues later)
app.get('/api/issues', authenticateToken, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'displayName email')
      .sort({ reportedAt: -1 }) // Latest first
      .limit(50); // Limit results

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('❌ Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues'
    });
  }
});

// Get user's own issues
app.get('/api/issues/my', authenticateToken, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user.userId })
      .sort({ reportedAt: -1 });

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('❌ Error fetching user issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your issues'
    });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API available at: http://localhost:${PORT}`);
      console.log('🔗 Endpoints available:');
      console.log('   POST /api/auth/register - User registration');
      console.log('   POST /api/auth/login - User login');
      console.log('   POST /api/issues - Report new issue');
      console.log('   GET /api/issues - Get all issues');
      console.log('   GET /api/issues/my - Get user\'s issues');
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
