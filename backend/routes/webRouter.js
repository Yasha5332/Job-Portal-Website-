const express = require('express');
const { register, login } = require('../controllers/authController');
const { updateJobSeekerProfile } = require('../controllers/profileController');
const { getAllJobs, getJobById, createJob, getMyJobs, deleteJob, updateJob } = require('../controllers/jobController');
const { getNotifications, markRead, markAllRead, dismissNotification, manualCreate, getUnreadCount } = require('../controllers/notificationController');
const { getMyApplications, applyForJob, withdrawApplication, updateStatus, getEmployerApplications } = require('../controllers/applicationController');
const { getAllJobSeekers, getAllEmployers, deleteUser, getStats, approveAllPendingJobs, getRecentActivity, generateReport } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get("/", (req, res) => {
    res.send("PartTimePro API is running...");
});

// Auth
router.post("/api/register", register);
router.post("/api/login", login);

// Profile (protected)
router.put("/api/profile/jobseeker", authMiddleware, updateJobSeekerProfile);

// Jobs (public read, protected write)
router.get("/api/jobs", getAllJobs);
router.get("/api/jobs/:id", getJobById);
router.post("/api/jobs", authMiddleware, createJob);

// Notifications (all protected)
router.get("/api/notifications", authMiddleware, getNotifications);
router.get("/api/notifications/unread-count", authMiddleware, getUnreadCount);
router.post("/api/notifications", authMiddleware, manualCreate); // Manual creation route
router.patch("/api/notifications/read-all", authMiddleware, markAllRead);
router.patch("/api/notifications/:id/read", authMiddleware, markRead);
router.delete("/api/notifications/:id", authMiddleware, dismissNotification);

// Applications (all protected)
router.get("/api/applications/my", authMiddleware, getMyApplications);
router.post("/api/applications", authMiddleware, applyForJob);
router.delete("/api/applications/:id", authMiddleware, withdrawApplication);
router.patch("/api/applications/:id/status", authMiddleware, updateStatus);

// Employer-only routes (protected)
router.get("/api/employer/jobs", authMiddleware, getMyJobs);
router.delete("/api/employer/jobs/:id", authMiddleware, deleteJob);
router.patch("/api/employer/jobs/:id", authMiddleware, updateJob);
router.get("/api/employer/applications", authMiddleware, getEmployerApplications);

// Admin routes (highly protected)
router.get("/api/admin/jobseekers", authMiddleware, adminMiddleware, getAllJobSeekers);
router.get("/api/admin/employers", authMiddleware, adminMiddleware, getAllEmployers);
router.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.delete("/api/admin/jobs/:id", authMiddleware, adminMiddleware, deleteJob);
router.patch("/api/admin/jobs/approve-all", authMiddleware, adminMiddleware, approveAllPendingJobs);
router.get("/api/admin/activity", authMiddleware, adminMiddleware, getRecentActivity);
router.get("/api/admin/report", authMiddleware, adminMiddleware, generateReport);
router.get("/api/admin/stats", authMiddleware, adminMiddleware, getStats);

module.exports = router;
