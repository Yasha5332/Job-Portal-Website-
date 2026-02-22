const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer', 'admin'],
    required: true
  }
}, { timestamps: true }); // Automatically creates created_at equivalent

module.exports = mongoose.model('User', userSchema);