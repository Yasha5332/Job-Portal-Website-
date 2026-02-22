import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function JobSeekerProfile() {
  const { user, token } = useAuth();

  // Seed from auth.user (populated on login / register) — falls back to empty
  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    location: user?.address || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    educationLevel: user?.education_background || '',
    institution: '',
    // skills stored as comma-separated string in DB → convert to array
    skills: user?.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    resumeName: 'No resume uploaded yet',
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert skills array back to comma-separated string for the DB
      const body = {
        full_name: profile.fullName,
        phone_number: profile.phone,
        address: profile.location,
        skills: profile.skills.join(', '),
        dob: profile.dob || null,
        education_background: profile.educationLevel,
      };

      await axios.put('http://localhost:5000/api/profile/jobseeker', body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save profile. Please try again.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50 text-slate-900">
      <main className="px-4 pt-10 mx-auto max-w-6xl">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
            <p className="mt-1 text-slate-600">Update your information to get better job matches.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center self-start gap-2 px-6 py-2.5 font-bold text-white transition-colors bg-indigo-600 rounded-xl hover:bg-indigo-700 sm:self-auto disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Left Column: Overview & Support ───────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-1">

            {/* Profile Snapshot Card */}
            <div className="flex flex-col items-center p-6 text-center bg-white border shadow-sm rounded-2xl border-slate-200">
              <div className="flex items-center justify-center w-24 h-24 mb-4 text-3xl font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                {profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
              <p className="font-medium text-slate-500">{profile.educationLevel}</p>
              <p className="mt-2 text-sm text-slate-400">Profile last updated: Today</p>
            </div>

            {/* Customer Support Widget */}
            <div className="p-6 border shadow-sm bg-gradient-to-br from-indigo-50 to-white rounded-2xl border-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 text-xl bg-indigo-100 rounded-full text-indigo-600">
                  🎧
                </div>
                <h3 className="font-bold text-indigo-900">Need Assistance?</h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-indigo-800/80">
                Having trouble with a job application or updating your profile? Our customer support team is here to help.
              </p>
              <button className="w-full px-4 py-2 text-sm font-bold text-indigo-700 transition-colors bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50">
                Contact Support
              </button>
            </div>

          </div>

          {/* ── Right Column: Edit Forms ──────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-2">

            {/* Contact Details & Demographics */}
            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="pb-4 mb-6 text-lg font-bold border-b text-slate-900 border-slate-100">Contact & Demographics</h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Date of Birth (Age Group)</label>
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Current Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Educational Background */}
            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="pb-4 mb-6 text-lg font-bold border-b text-slate-900 border-slate-100">Educational Background</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Highest Level of Education</label>
                  <select
                    name="educationLevel"
                    value={profile.educationLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="High School">High School / GED</option>
                    <option value="Some College">Some College</option>
                    <option value="Associate's Degree">Associate's Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Institution Name</label>
                  <input
                    type="text"
                    name="institution"
                    value={profile.institution}
                    onChange={handleChange}
                    placeholder="E.g., State University"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Skills & Resume */}
            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="pb-4 mb-6 text-lg font-bold border-b text-slate-900 border-slate-100">Resume & Skills</h3>

              <div className="mb-8">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Upload Resume / CV</label>
                <div className="flex items-center justify-between p-4 border-2 border-dashed rounded-xl border-slate-300 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-xl bg-white border rounded-lg shadow-sm border-slate-200">📄</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{profile.resumeName}</p>
                      <p className="text-xs text-slate-500">PDF, DOCX up to 5MB</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-bold transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-100">
                    Replace
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Your Skills</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-indigo-400 hover:text-indigo-800 focus:outline-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Type a skill and press Add..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 font-bold text-white transition-colors bg-slate-800 rounded-xl hover:bg-slate-900"
                  >
                    Add
                  </button>
                </form>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}