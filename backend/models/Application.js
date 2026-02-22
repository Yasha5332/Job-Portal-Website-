const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  match_score: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);