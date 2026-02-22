const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  company_name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);