const JobSeeker = require('../models/JobSeeker');
const User = require('../models/User');

// ─── UPDATE JOB SEEKER PROFILE ───────────────────────────────────────────────
// PUT /api/profile/jobseeker
// Requires: Authorization: Bearer <token>  (userId decoded from JWT middleware)
exports.updateJobSeekerProfile = async (req, res) => {
    try {
        const userId = req.userId; // set by auth middleware

        const {
            full_name,
            phone_number,
            address,
            skills,
            dob,
            education_background,
        } = req.body;

        // Find the job seeker profile by the linked user id
        const profile = await JobSeeker.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ message: 'Job seeker profile not found.' });
        }

        // Update only the fields that were sent
        if (full_name !== undefined) profile.full_name = full_name;
        if (phone_number !== undefined) profile.phone_number = phone_number;
        if (address !== undefined) profile.address = address;
        if (skills !== undefined) profile.skills = skills;
        if (dob !== undefined) profile.dob = dob || null;
        if (education_background !== undefined) profile.education_background = education_background;

        await profile.save();

        res.status(200).json({
            message: 'Profile updated successfully!',
            profile: {
                full_name: profile.full_name,
                phone_number: profile.phone_number,
                address: profile.address,
                skills: profile.skills,
                dob: profile.dob,
                education_background: profile.education_background,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
