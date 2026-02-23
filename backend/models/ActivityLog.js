const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    user: {
        type: String, // Can be a name or 'System'
        required: true
    },
    details: {
        type: String
    },
    type: {
        type: String,
        enum: ['registration', 'job_post', 'approval', 'system', 'complaint'],
        default: 'system'
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
