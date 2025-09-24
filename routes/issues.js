const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all issues
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Issues endpoint working',
    data: []
  });
});

module.exports = router;
