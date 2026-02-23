const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary_range: {
    type: String
  },
  working_hours: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending_approval', 'draft'],
    default: 'pending_approval'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);