const express = require('express');
const { register, login } = require('../controllers/authController');
const { updateJobSeekerProfile } = require('../controllers/profileController');
const { getAllJobs, getJobById, createJob, getMyJobs, deleteJob, updateJob } = require('../controllers/jobController');
const { getNotifications, markRead, markAllRead, dismissNotification, manualCreate } = require('../controllers/notificationController');
const { getMyApplications, applyForJob, withdrawApplication, updateStatus, getEmployerApplications } = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;
