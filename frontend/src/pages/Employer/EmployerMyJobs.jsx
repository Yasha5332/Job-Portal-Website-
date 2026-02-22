import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://localhost:5000';

const STATUS_MAP = {
  active: 'Active',
  closed: 'Closed',
  pending_approval: 'Draft'
};

// ── Edit Job Modal ─────────────────────────────────────────────────────────────
function EditJobModal({ job, token, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: job.title || '',
    description: job.description || '',
    category: job.category || '',
    location: job.location || '',
    salary_range: job.salary_range || '',
    working_hours: job.working_hours || '',
    status: job.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/employer/jobs/${job._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update job.');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Edit Job Posting</h2>
        <p className="text-sm text-slate-400 mb-6">Update the details for your job listing.</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
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
                required={field.name === 'title' || field.name === 'category' || field.name === 'location'}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="pending_approval">Draft (Pending Approval)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              required
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EmployerMyJobs() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState("All");
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    if (!token) {
      setError('You must be logged in as an employer.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/employer/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch jobs.');
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/employer/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Delete failed.');
      }
      setJobs(prev => prev.filter(j => j._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const uiStatus = STATUS_MAP[job.status] || 'Active';
    return filter === "All" || uiStatus === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading your jobs…</p>
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
          <button onClick={fetchJobs} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {editingJob && (
        <EditJobModal
          job={editingJob}
          token={token}
          onClose={() => setEditingJob(null)}
          onSuccess={fetchJobs}
        />
      )}

      <main className="max-w-6xl mx-auto px-6 pt-10">

        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Jobs</h1>
            <p className="text-slate-600 mt-1">Manage your active listings, drafts, and past jobs.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4 overflow-x-auto">
          {["All", "Active", "Draft", "Closed"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map(job => {
            const uiStatus = STATUS_MAP[job.status] || 'Active';
            return (
              <div key={job._id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${uiStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        uiStatus === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {uiStatus}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {job.location} • {job.category} • Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="flex gap-6 text-center">
                    <div>
                      <strong className="block text-xl font-black text-slate-900">{job.applicantCount || 0}</strong>
                      <span className="text-xs font-bold text-slate-500 uppercase">Applicants</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setEditingJob(job)}
                      className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 font-medium text-lg">No jobs found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}