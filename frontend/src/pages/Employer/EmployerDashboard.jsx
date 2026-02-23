import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://localhost:5000';

// ── Helper: generate avatar initials + colour from a name ──────────────────────
const AVATAR_COLOURS = [
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

function avatarProps(name = '', index = 0) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return { initials, colour: AVATAR_COLOURS[index % AVATAR_COLOURS.length] };
}

// ── Relative time helper ────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  return `${weeks} weeks ago`;
}

// ── Post New Job Modal ─────────────────────────────────────────────────────────
function PostJobModal({ token, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', salary_range: '', working_hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e, status = 'active') => {
    if (e) e.preventDefault();

    // Basic validation
    if (!form.title || !form.category || !form.location || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post job.');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Post a New Job</h2>
        <p className="text-sm text-slate-400 mb-6">Fill in the details below to publish a new job posting.</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          {[
            { name: 'title', label: 'Job Title', placeholder: 'e.g. Weekend Barista' },
            { name: 'category', label: 'Category', placeholder: 'e.g. Food & Beverage' },
            { name: 'location', label: 'Location', placeholder: 'e.g. Yangon, Bahan' },
            { name: 'salary_range', label: 'Salary Range', placeholder: 'e.g. 300,000 – 500,000 MMK/month' },
            { name: 'working_hours', label: 'Working Hours', placeholder: 'e.g. Weekends, 8am–4pm' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleSubmit(null, 'active')}
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 active:scale-95 shadow-lg shadow-indigo-100"
            >
              {loading ? 'Posting…' : 'Post Job'}
            </button>
            <button
              onClick={() => handleSubmit(null, 'draft')}
              disabled={loading}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition disabled:opacity-60 active:scale-95"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const { token } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // ── Fetch employer data ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) { setError('You must be logged in as an employer.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [jobsRes, appsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/employer/jobs`, { headers }),
        fetch(`${BASE_URL}/api/employer/applications`, { headers }),
      ]);

      if (!jobsRes.ok) {
        const d = await jobsRes.json();
        throw new Error(d.message || 'Failed to fetch jobs.');
      }
      if (!appsRes.ok) {
        const d = await appsRes.json();
        throw new Error(d.message || 'Failed to fetch applications.');
      }

      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();

      setJobs(jobsData.jobs || []);
      setApplications(appsData.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Delete a job ─────────────────────────────────────────────────────────────
  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All associated applications will also be removed.')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/employer/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setApplications((prev) => prev.filter((a) => a.job?._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ── Update application status ─────────────────────────────────────────────────
  const handleStatusChange = async (appId, newStatus) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );
    try {
      const res = await fetch(`${BASE_URL}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
      fetchData(); // Revert by re-fetching
    }
  };

  // ── Computed stats ───────────────────────────────────────────────────────────
  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  // ── Loading / Error States ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-500 mb-6">{error}</p>
          <button onClick={fetchData} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">

      {showPostModal && (
        <PostJobModal
          token={token}
          onClose={() => setShowPostModal(false)}
          onSuccess={fetchData}
        />
      )}

      <main className="px-6 pt-10 mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-5 mb-10 md:flex-row md:items-end">
          <div>
            <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-indigo-500">Employer Portal</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
              Manage your job postings, track statistics, and review applicants.
            </p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center self-start gap-2 px-6 py-3 text-[15px] font-bold text-white transition-all bg-indigo-600 shadow-md shadow-indigo-200 md:self-auto rounded-xl hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post a New Job
          </button>
        </div>

        {/* ── Stats Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 mb-10 sm:grid-cols-3">
          <StatCard icon="💼" colour="bg-indigo-50 text-indigo-600" label="Active Jobs" value={activeJobsCount} />
          <StatCard icon="👥" colour="bg-emerald-50 text-emerald-600" label="Total Applicants" value={totalApplicants} />
          <StatCard icon="📋" colour="bg-amber-50 text-amber-600" label="Total Postings" value={jobs.length} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Manage Job Postings ─────────────────────────────────────── */}
          <div className="flex flex-col overflow-hidden bg-white border shadow-sm lg:col-span-2 rounded-2xl border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-[17px] font-bold tracking-tight text-slate-900">Manage Job Postings</h2>
              <button onClick={fetchData} title="Refresh" className="text-slate-300 hover:text-indigo-500 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold tracking-widest uppercase border-b bg-slate-50 text-slate-400 border-slate-100">
                    <th className="px-6 py-4">Job Details</th>
                    <th className="px-6 py-4">Applicants</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <strong className="block text-[15px] font-bold text-slate-900 leading-tight">{job.title}</strong>
                        <span className="text-[12px] text-slate-400 mt-0.5 block">
                          {job.location} · Posted {timeAgo(job.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[15px] font-bold text-slate-800">{job.applicantCount ?? 0}</span>
                        <span className="font-medium text-slate-500 text-[13px] ml-1">applicants</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide capitalize ${job.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : job.status === 'closed'
                            ? 'bg-red-100 text-red-500'
                            : job.status === 'draft'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="px-3 py-1.5 text-[13px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-slate-400 text-[15px]">No job postings yet.</p>
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="mt-3 text-indigo-600 font-semibold text-[14px] hover:underline"
                        >
                          Post your first job →
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Applicants ────────────────────────────────────────── */}
          <div className="flex flex-col overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-[17px] font-bold tracking-tight text-slate-900">Recent Applicants</h2>
              <span className="text-[12px] font-semibold text-slate-400">{applications.length} total</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 overflow-y-auto max-h-[520px]">
              {applications.slice(0, 10).map((app, idx) => {
                const name = app.seeker?.full_name || 'Unknown Applicant';
                const { initials, colour } = avatarProps(name, idx);
                return (
                  <div key={app._id} className="p-5 transition-colors hover:bg-slate-50/70">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[13px] shrink-0 ${colour}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="block text-[15px] font-bold truncate text-slate-900 leading-tight">{name}</strong>
                        <span className="text-[12px] text-slate-400 truncate block mt-0.5">
                          For {app.job?.title || '—'} · {timeAgo(app.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`w-full text-xs font-bold border-none rounded-lg px-3 py-2 outline-none cursor-pointer appearance-none ${app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' :
                            app.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                              app.status === 'Reviewed' ? 'bg-indigo-50 text-indigo-700' :
                                'bg-amber-50 text-amber-700'
                            }`}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Reviewed">👁️ Reviewed</option>
                          <option value="Accepted">✓ Accepted</option>
                          <option value="Rejected">✕ Rejected</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-50">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {applications.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-400">
                  <p className="text-[15px]">No applicants yet.</p>
                  <p className="text-[13px] mt-1">Applications will appear here once job seekers apply.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ── Reusable StatCard ──────────────────────────────────────────────────────────
function StatCard({ icon, colour, label, value }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-white border shadow-sm rounded-2xl border-slate-100">
      <div className={`flex items-center justify-center w-14 h-14 text-2xl rounded-2xl shrink-0 ${colour}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">{label}</p>
        <strong className="text-5xl font-black text-slate-900 leading-none">{value}</strong>
      </div>
    </div>
  );
}