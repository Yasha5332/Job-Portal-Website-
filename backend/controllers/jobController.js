const Job = require('../models/Job');
const Employer = require('../models/Employer');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');

// ─── GET ALL ACTIVE JOBS (public) ─────────────────────────────────────────────
// GET /api/jobs  – supports ?keyword=&location=&category= query params
exports.getAllJobs = async (req, res) => {
  try {
    const { keyword, location, category } = req.query;

    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate('employer', 'company_name')
      .lean();

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET SINGLE JOB ───────────────────────────────────────────────────────────
// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'company_name phone_number')
      .lean();
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── CREATE JOB (employer only) ───────────────────────────────────────────────
// POST /api/jobs  – requires authMiddleware
exports.createJob = async (req, res) => {
  try {
    if (req.userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs.' });
    }

    const employer = await Employer.findOne({ user: req.userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found.' });
    }

    const { title, description, category, location, salary_range, working_hours, status } = req.body;

    const job = await new Job({
      employer: employer._id,
      title,
      description,
      category,
      location,
      salary_range: salary_range || '',
      working_hours: working_hours || '',
      status: status || 'active',
    }).save();

    await new ActivityLog({
      action: 'Job Posted',
      user: employer.company_name,
      details: title,
      type: 'job_post'
    }).save();

    res.status(201).json({ message: 'Job posted successfully!', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET MY JOBS (employer only) ──────────────────────────────────────────────
exports.getMyJobs = async (req, res) => {
  try {
    if (req.userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can access this.' });
    }

    const employer = await Employer.findOne({ user: req.userId });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found.' });

    const jobs = await Job.find({ employer: employer._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach applicant count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job, applicantCount };
      })
    );

    res.status(200).json({ jobs: jobsWithCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE JOB (employer only) ───────────────────────────────────────────────
// DELETE /api/employer/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    if (req.userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can delete jobs.' });
    }

    const employer = await Employer.findOne({ user: req.userId });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found.' });

    const job = await Job.findOne({ _id: req.params.id, employer: employer._id });
    if (!job) return res.status(404).json({ message: 'Job not found or not yours.' });

    await job.deleteOne();
    // Also remove all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({ message: 'Job deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── UPDATE JOB (employer only) ───────────────────────────────────────────────
// PATCH /api/employer/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    if (req.userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can update jobs.' });
    }

    const employer = await Employer.findOne({ user: req.userId });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found.' });

    const allowed = ['title', 'description', 'category', 'location', 'salary_range', 'working_hours', 'status'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: employer._id },
      updates,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found or not yours.' });

    res.status(200).json({ message: 'Job updated.', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};