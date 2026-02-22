import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

// ── Candidate Profile Modal ──────────────────────────────────────────────────
function CandidateProfileModal({ app, onClose }) {
  if (!app) return null;
  const seeker = app.seeker || {};
  const job = app.job || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="relative p-8 bg-linear-to-br from-indigo-600 to-violet-700 text-white">
          <button onClick={onClose} className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shrink-0 shadow-inner">
              {seeker.full_name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{seeker.full_name}</h2>
              <p className="text-indigo-100 font-medium">{job.title}</p>
              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  Match Score: {app.match_score || 0}%
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  Status: {app.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Information</h3>
              <p className="text-sm font-bold text-slate-700">Detailed contact info restricted to premium view.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Application Info</h3>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Applied Date</span>
                <span className="text-slate-900 font-bold">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors">
            Download Resume
          </button>
          <button onClick={onClose} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployerCandidates() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setError('You must be logged in as an employer.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [appRes, jobsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/employer/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/employer/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setApplications(appRes.data.applications || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (appId, nextStatus) => {
    setUpdatingId(appId);
    try {
      await axios.patch(`${API_BASE}/api/applications/${appId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplications(prev => prev.map(app =>
        app._id === appId ? { ...app, status: nextStatus } : app
      ));
      toast.success(`Candidate moved to ${nextStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];

  const filteredApps = applications.filter(app =>
    selectedJobId === "All" || app.job?._id === selectedJobId
  );

  const columns = [
    { id: "Pending", title: "⏳ Pending Review", color: "border-amber-400" },
    { id: "Reviewed", title: "👁️ Reviewed", color: "border-indigo-400" },
    { id: "Accepted", title: "✓ Accepted", color: "border-emerald-400" },
    { id: "Rejected", title: "✕ Rejected", color: "border-red-400" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading participants…</p>
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
          <button onClick={fetchData} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* Profile Modal */}
      <CandidateProfileModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
      />

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Candidates</h1>
            <p className="text-slate-600 mt-1">Review and manage your applicant pipeline.</p>
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 min-w-[250px]"
          >
            <option value="All">All Jobs</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mb-16">
          {columns.map(col => (
            <div key={col.id} className={`bg-slate-100/50 rounded-2xl p-4 border-t-4 ${col.color}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">{col.title}</h3>
                <span className="bg-white text-slate-500 font-bold text-xs px-2 py-1 rounded-md shadow-sm">
                  {filteredApps.filter(a => a.status === col.id).length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {filteredApps.filter(a => a.status === col.id).map(app => (
                  <div key={app._id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all ${updatingId === app._id ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-400'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-slate-900 block">{app.seeker?.full_name || 'Anonymous candidate'}</strong>
                      <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase">Match {app.match_score || 0}%</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mb-3">{app.job?.title}</p>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded text-[11px] font-bold px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold py-1.5 rounded-lg transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
                {filteredApps.filter(a => a.status === col.id).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs italic">Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Candidate Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">All Applicants</h2>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredApps.length} Results</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Match</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApps.length > 0 ? filteredApps.map(app => (
                  <tr key={app._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {app.seeker?.full_name || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{app.job?.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold whitespace-nowrap">
                        {app.match_score || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all transform hover:scale-105"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      No candidates found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
