const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String
  },
  address: {
    type: String
  },
  skills: {
    type: String
  },
  dob: {
    type: Date
  },
  education_background: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);