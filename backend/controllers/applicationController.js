const Application = require('../models/Application');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const { createNotification } = require('./notificationController');

// ── UTILITY: Calculate Match Score ───────────────────────────────────────────
const calculateMatchScore = (jobDescription, seekerSkills) => {
  if (!jobDescription || !seekerSkills) return 0;

  const jobWords = jobDescription.toLowerCase().match(/\w+/g) || [];
  const seekerWords = seekerSkills.toLowerCase().match(/\w+/g) || [];

  if (jobWords.length === 0) return 0;

  // Filter out common stop words to improve accuracy (simple version)
  const stopWords = new Set(['and', 'the', 'is', 'for', 'with', 'to', 'in', 'of', 'on', 'a', 'an']);
  const importantJobWords = [...new Set(jobWords.filter(w => w.length > 2 && !stopWords.has(w)))];

  if (importantJobWords.length === 0) return 0;

  const matches = importantJobWords.filter(word => seekerWords.includes(word));
  const score = Math.round((matches.length / importantJobWords.length) * 100);

  return Math.min(score + 20, 100); // Add a small base boost, cap at 100
};

// ─── GET MY APPLICATIONS ─────────────────────────────────────────────────────
// GET /api/applications/my  (protected — job seeker)
exports.getMyApplications = async (req, res) => {
  try {
    const seeker = await JobSeeker.findOne({ user: req.userId });
    if (!seeker) return res.status(404).json({ message: 'Job seeker profile not found.' });

    const applications = await Application.find({ seeker: seeker._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        select: 'title category location salary_range working_hours',
        populate: { path: 'employer', select: 'company_name' },
      })
      .lean();

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── APPLY FOR A JOB ─────────────────────────────────────────────────────────
// POST /api/applications  (protected — job seeker)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required.' });

    const seeker = await JobSeeker.findOne({ user: req.userId });
    if (!seeker) return res.status(404).json({ message: 'Job seeker profile not found.' });

    const existing = await Application.findOne({ job: jobId, seeker: seeker._id });
    if (existing) return res.status(409).json({ message: 'You have already applied for this job.' });

    const job = await Job.findById(jobId).populate('employer');
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const application = await new Application({
      job: jobId,
      seeker: seeker._id,
      status: 'Pending',
      match_score: calculateMatchScore(job.description + ' ' + job.title, seeker.skills + ' ' + seeker.education_background)
    }).save();

    // Notify Employer
    if (job.employer && job.employer.user) {
      await createNotification({
        userId: job.employer.user,
        title: 'New Application',
        message: `<strong>${seeker.full_name}</strong> applied for <strong>${job.title}</strong>.`,
        type: 'jobs'
      });
    }

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── WITHDRAW APPLICATION ────────────────────────────────────────────────────
// DELETE /api/applications/:id  (protected — job seeker)
exports.withdrawApplication = async (req, res) => {
  try {
    const seeker = await JobSeeker.findOne({ user: req.userId });
    if (!seeker) return res.status(404).json({ message: 'Job seeker profile not found.' });

    const application = await Application.findOne({ _id: req.params.id, seeker: seeker._id }).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending applications can be withdrawn.' });
    }

    const job = application.job;
    const employer = await Job.findById(job?._id).populate('employer');

    await application.deleteOne();

    // Notify Employer
    if (employer?.employer?.user) {
      await createNotification({
        userId: employer.employer.user,
        title: 'Application Withdrawn',
        message: `<strong>${seeker.full_name}</strong> has withdrawn their application for <strong>${job?.title}</strong>.`,
        type: 'jobs'
      });
    }

    res.status(200).json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── UPDATE STATUS (employer side) ───────────────────────────────────────────
// PATCH /api/applications/:id/status  (protected — employer)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({
      path: 'seeker',
      select: 'user full_name'
    }).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found.' });

    // Notify Job Seeker
    if (application.seeker && application.seeker.user) {
      await createNotification({
        userId: application.seeker.user,
        title: 'Application Update',
        message: `Your application for <strong>${application.job?.title}</strong> has been marked as <strong>${status}</strong>.`,
        type: 'status'
      });
    }

    res.status(200).json({ message: 'Status updated.', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET EMPLOYER APPLICATIONS ────────────────────────────────────────────────
// GET /api/employer/applications  (protected — employer)
// Returns all applications for all jobs owned by the logged-in employer.
exports.getEmployerApplications = async (req, res) => {
  try {
    if (req.userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can access this.' });
    }

    const employer = await Employer.findOne({ user: req.userId });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found.' });

    // Find all jobs belonging to this employer
    const jobs = await Job.find({ employer: employer._id }).select('_id').lean();
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'seeker',
        select: 'full_name',
      })
      .populate({
        path: 'job',
        select: 'title',
      })
      .lean();

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};