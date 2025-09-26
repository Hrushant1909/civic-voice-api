const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
    default: () => Date.now().toString()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  aadharCardNo: {
    type: String,
    required: true,
    unique: true
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  stats: {
    totalIssuesReported: { type: Number, default: 0 },
    totalIssuesResolved: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
