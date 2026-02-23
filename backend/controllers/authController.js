const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper – sign a token with the user's id and role
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, role, full_name, company_name, username } = req.body;

    // 1. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Create central User document
    const savedUser = await new User({ email, password_hash, role }).save();

    // 4. Create role-specific profile and capture fields to return
    let profile = {};
    if (role === 'job_seeker') {
      const js = await new JobSeeker({
        user: savedUser._id,
        full_name,
        phone_number: req.body.phone_number || '',
        address: req.body.address || '',
        skills: req.body.skills || '',
        dob: req.body.dob || null,
        education_background: req.body.education_background || '',
      }).save();
      profile = {
        full_name: js.full_name,
        phone_number: js.phone_number,
        address: js.address,
        skills: js.skills,
        dob: js.dob,
        education_background: js.education_background,
      };
    } else if (role === 'employer') {
      const emp = await new Employer({
        user: savedUser._id,
        company_name,
        phone_number: req.body.phone_number || '',
      }).save();
      profile = {
        company_name: emp.company_name,
        phone_number: emp.phone_number,
      };
    } else if (role === 'admin') {
      const adm = await new Admin({
        user: savedUser._id,
        username,
        full_name: req.body.full_name || '',
        phone_number: req.body.phone_number || '',
      }).save();
      profile = {
        username: adm.username,
        full_name: adm.full_name,
        phone_number: adm.phone_number,
      };
    }

    // 4.5 Log activity
    await new ActivityLog({
      action: role === 'job_seeker' ? 'New Job Seeker Registered' : role === 'employer' ? 'New Employer Registered' : 'New Admin Registered',
      user: full_name || company_name || username || email,
      type: 'registration'
    }).save();

    // 5. Issue JWT and return user object
    const token = signToken(savedUser);

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      role: savedUser.role,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        ...profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password.' });

    // 3. Fetch role-specific profile to return with the token
    let profile = {};
    if (user.role === 'job_seeker') {
      const js = await JobSeeker.findOne({ user: user._id });
      if (js) profile = {
        full_name: js.full_name,
        phone_number: js.phone_number,
        address: js.address,
        skills: js.skills,
        dob: js.dob,
        education_background: js.education_background,
      };
    } else if (user.role === 'employer') {
      const emp = await Employer.findOne({ user: user._id });
      if (emp) profile = {
        company_name: emp.company_name,
        phone_number: emp.phone_number,
      };
    } else if (user.role === 'admin') {
      const adm = await Admin.findOne({ user: user._id });
      if (adm) profile = {
        username: adm.username,
        full_name: adm.full_name,
        phone_number: adm.phone_number,
      };
    }

    // 4. Issue JWT and return user object
    const token = signToken(user);

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        ...profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};