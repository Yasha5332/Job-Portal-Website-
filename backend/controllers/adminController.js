const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');
const Application = require('../models/Application');

/**
 * Get all job seekers with their user data
 */
exports.getAllJobSeekers = async (req, res) => {
    try {
        const jobSeekers = await JobSeeker.find().populate('user', 'email role createdAt');
        res.status(200).json(jobSeekers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job seekers', error: error.message });
    }
};

/**
 * Get all employers with their user data
 */
exports.getAllEmployers = async (req, res) => {
    try {
        const employers = await Employer.find().populate('user', 'email role createdAt');
        res.status(200).json(employers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employers', error: error.message });
    }
};

/**
 * Delete a user and their associated profile
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'job_seeker') {
            const seeker = await JobSeeker.findOne({ user: id });
            if (seeker) {
                // Delete all applications for this seeker
                await Application.deleteMany({ seeker: seeker._id });
                await JobSeeker.findByIdAndDelete(seeker._id);
            }
        } else if (user.role === 'employer') {
            const employer = await Employer.findOne({ user: id });
            if (employer) {
                // Find all jobs by this employer
                const jobs = await Job.find({ employer: employer._id });
                const jobIds = jobs.map(j => j._id);
                // Delete all applications for those jobs
                await Application.deleteMany({ job: { $in: jobIds } });
                // Delete all jobs
                await Job.deleteMany({ employer: employer._id });
                await Employer.findByIdAndDelete(employer._id);
            }
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

/**
 * Get system statistics
 */
exports.getStats = async (req, res) => {
    try {
        const seekerCount = await JobSeeker.countDocuments();
        const employerCount = await Employer.countDocuments();
        const activeJobCount = await Job.countDocuments({ status: 'active' });
        const pendingJobCount = await Job.countDocuments({ status: 'pending_approval' });

        res.status(200).json({
            jobSeekers: seekerCount,
            employers: employerCount,
            jobs: activeJobCount,
            pendingJobs: pendingJobCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

/**
 * Admin: Approve all pending jobs
 */
exports.approveAllPendingJobs = async (req, res) => {
    try {
        const result = await Job.updateMany({ status: 'pending_approval' }, { status: 'active' });

        if (result.nModified > 0 || result.modifiedCount > 0) {
            await new ActivityLog({
                action: 'Bulk Job Approval',
                user: 'Admin',
                details: `Approved ${result.nModified || result.modifiedCount} pending jobs.`,
                type: 'approval'
            }).save();
        }

        res.status(200).json({ message: `Successfully approved ${result.nModified || result.modifiedCount} jobs.` });
    } catch (error) {
        res.status(500).json({ message: 'Error approving jobs', error: error.message });
    }
};

/**
 * Get recent activity logs
 */
exports.getRecentActivity = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
    }
};

/**
 * Generate system report
 */
exports.generateReport = async (req, res) => {
    try {
        const seekerCount = await JobSeeker.countDocuments();
        const employerCount = await Employer.countDocuments();
        const totalJobs = await Job.countDocuments();

        const report = {
            title: 'PartTimePro System Report',
            generatedAt: new Date(),
            statistics: {
                totalUsers: seekerCount + employerCount,
                jobSeekers: seekerCount,
                employers: employerCount,
                totalJobPostings: totalJobs
            },
            status: 'All systems operational'
        };

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

/**
 * Admin: Delete any job posting
 */
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJob = await Job.findByIdAndDelete(id);
        if (!deletedJob) return res.status(404).json({ message: 'Job not found' });

        // Clean up applications associated with this job
        await Application.deleteMany({ job: id });

        res.status(200).json({ message: 'Job posting and associated applications removed by administrator' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};
