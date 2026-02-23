import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

// ── Demo data — shown when DB has no real applications ───────────────────────
const DEMO_APPLICATIONS = [
  {
    _id: 'demo-1',
    status: 'Accepted',
    createdAt: '2026-02-10T08:00:00Z',
    job: {
      title: 'Junior Web Developer',
      location: 'Downtown (Hybrid)',
      salary_range: '$20/hr',
      employer: { company_name: 'Startup Hub' },
    },
  },
  {
    _id: 'demo-2',
    status: 'Reviewed',
    createdAt: '2026-02-13T10:30:00Z',
    job: {
      title: 'Customer Support Representative',
      location: 'Remote',
      salary_range: '$15/hr',
      employer: { company_name: 'TechCorp' },
    },
  },
  {
    _id: 'demo-3',
    status: 'Pending',
    createdAt: '2026-02-17T14:00:00Z',
    job: {
      title: 'Graphic Designer',
      location: 'Remote',
      salary_range: '$17/hr',
      employer: { company_name: 'PrintWave Studio' },
    },
  },
  {
    _id: 'demo-4',
    status: 'Pending',
    createdAt: '2026-02-19T09:00:00Z',
    job: {
      title: 'Weekend Barista',
      location: 'Downtown',
      salary_range: '$12/hr',
      employer: { company_name: 'Daily Grind Coffee House' },
    },
  },
  {
    _id: 'demo-5',
    status: 'Rejected',
    createdAt: '2026-02-05T16:00:00Z',
    job: {
      title: 'Retail Sales Associate',
      location: 'City Mall',
      salary_range: '$13/hr',
      employer: { company_name: 'Urban Outfitters' },
    },
  },
];

// ── Status config (matches DB enum: Pending, Reviewed, Accepted, Rejected) ───
const STATUS_CONFIG = {
  Pending: {
    label: '⏳ Pending',
    badge: 'bg-amber-100 text-amber-700',
    progress: [
      { label: 'Applied', state: 'active' },
      { label: 'Reviewed', state: 'default' },
      { label: 'Offer', state: 'default' },
      { label: 'Hired', state: 'default' },
    ],
  },
  Reviewed: {
    label: '👁 Reviewed',
    badge: 'bg-indigo-100 text-indigo-700',
    progress: [
      { label: 'Applied', state: 'done' },
      { label: 'Reviewed', state: 'active' },
      { label: 'Offer', state: 'default' },
      { label: 'Hired', state: 'default' },
    ],
  },
  Accepted: {
    label: '✓ Accepted',
    badge: 'bg-emerald-100 text-emerald-700',
    progress: [
      { label: 'Applied', state: 'done' },
      { label: 'Reviewed', state: 'done' },
      { label: 'Offer', state: 'active' },
      { label: 'Hired', state: 'default' },
    ],
  },
  Rejected: {
    label: '✕ Rejected',
    badge: 'bg-red-100 text-red-700',
    progress: [
      { label: 'Applied', state: 'done' },
      { label: 'Reviewed', state: 'done' },
      { label: 'Rejected', state: 'rejected' },
      { label: '—', state: 'disabled' },
    ],
  },
};

// ── Avatar color based on company initial ────────────────────────────────────
const GRADIENTS = [
  'bg-gradient-to-br from-indigo-600 to-purple-600',
  'bg-gradient-to-br from-cyan-600 to-cyan-500',
  'bg-gradient-to-br from-emerald-600 to-emerald-500',
  'bg-gradient-to-br from-rose-600 to-pink-500',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-violet-600 to-indigo-500',
];
const gradientFor = (str = '') =>
  GRADIENTS[str.charCodeAt(0) % GRADIENTS.length];

// ── Friendly date ─────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ── Progress step renderer ────────────────────────────────────────────────────
function ProgressStep({ step }) {
  const base = 'flex-1 text-center py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-4 transition-all ';
  const cls =
    step.state === 'done' ? base + 'border-indigo-600 text-indigo-600' :
      step.state === 'active' ? base + 'border-indigo-400 text-indigo-700 bg-indigo-50' :
        step.state === 'rejected' ? base + 'border-red-500 text-red-600 bg-red-50' :
          step.state === 'disabled' ? base + 'border-slate-200 text-slate-300' :
            base + 'border-slate-200 text-slate-400';
  return <div className={cls}>{step.label}</div>;
}

export default function Applications() {
  const { token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // ── Fetch — falls back to demo data when DB is empty ─────────────────────
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchErr('');
    try {
      const { data } = await axios.get(`${API_BASE}/api/applications/my`, authHeaders);
      const real = data.applications || [];
      if (real.length > 0) {
        setApplications(real);
        setIsDemo(false);
      } else {
        setApplications(DEMO_APPLICATIONS);
        setIsDemo(true);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback to demo but show a warning if it's a real error (not just empty)
      setApplications(DEMO_APPLICATIONS);
      setIsDemo(true);
      if (err.response?.status !== 404) {
        setFetchErr('Could not fetch real applications. Showing demo data.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // ── Withdraw ──────────────────────────────────────────────────────────────
  const handleWithdraw = async (id) => {
    if (isDemo) {
      toast.error('Withdraw is disabled in Demo Mode.');
      return;
    }
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await axios.delete(`${API_BASE}/api/applications/${id}`, authHeaders);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to withdraw.';
      toast.error(msg);
      fetchApplications();
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filtered = applications.filter(app => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchSearch = !q ||
      app.job?.title?.toLowerCase().includes(q) ||
      app.job?.employer?.company_name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Stats from displayed data (real or demo) ──────────────────────────────
  const stats = {
    total: applications.length,
    Pending: applications.filter(a => a.status === 'Pending').length,
    Reviewed: applications.filter(a => a.status === 'Reviewed').length,
    Accepted: applications.filter(a => a.status === 'Accepted').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <main className="max-w-5xl mx-auto px-4 pt-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Applications</h1>
            <p className="text-slate-600">Track and manage all your job applications in one place.</p>
          </div>
          <a href="/jobs" className="self-start sm:self-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap">
            + Browse More Jobs
          </a>
        </div>

        {/* ── Demo banner ── */}
        {!loading && isDemo && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <span>🎭 Demo Mode</span>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, color: 'border-t-indigo-600' },
            { label: 'Pending', value: stats.Pending, color: 'border-t-amber-500' },
            { label: 'Reviewed', value: stats.Reviewed, color: 'border-t-indigo-400' },
            { label: 'Accepted', value: stats.Accepted, color: 'border-t-emerald-500' },
            { label: 'Rejected', value: stats.Rejected, color: 'border-t-red-500' },
          ].map(s => (
            <div key={s.label} className={`bg-white p-5 rounded-xl border border-slate-200 border-t-4 ${s.color} shadow-sm flex flex-col items-center`}>
              <strong className="text-2xl font-black text-slate-900">{loading ? '—' : s.value}</strong>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-3 text-slate-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="sm:w-48 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── Fetch error (only shown if not falling back to demo) ── */}
        {!loading && fetchErr && !isDemo && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            <p className="font-semibold mb-2">⚠️ {fetchErr}</p>
            <button onClick={fetchApplications} className="text-sm underline hover:text-red-900">Retry</button>
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && !fetchErr && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.length > 0 ? filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
              const company = app.job?.employer?.company_name || 'Company';
              const initials = company.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

              return (
                <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden">

                  {/* Header */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${gradientFor(company)}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{app.job?.title || 'Job'}</h3>
                        <p className="font-medium text-slate-600 mb-2">{company}</p>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          📅 Applied {fmtDate(app.createdAt)}
                          {app.job?.location && <><span className="text-slate-300">•</span> {app.job.location}</>}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap self-start ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex justify-between bg-slate-50 border-y border-slate-100">
                    {cfg.progress.map((step, i) => <ProgressStep key={i} step={step} />)}
                  </div>

                  {/* Actions */}
                  {(app.status === 'Pending' || app.status === 'Rejected') && (
                    <div className="p-5 bg-white flex gap-3 mt-auto">
                      {app.status === 'Pending' && (
                        <button onClick={() => handleWithdraw(app._id)} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-lg transition-colors">✕ Withdraw</button>
                      )}
                      {app.status === 'Rejected' && (
                        <a href="/jobs" className="flex-1 py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors">🔍 Find Similar</a>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-1 lg:col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <div className="text-4xl mb-3">{applications.length === 0 ? '📭' : '🔍'}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {applications.length === 0 ? "You haven't applied to any jobs yet" : 'No applications match your search'}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {applications.length === 0 ? 'Find a job you like and hit Apply Now!' : 'Try adjusting your search or filter.'}
                </p>
                {applications.length === 0 && (
                  <a href="/jobs" className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                    Browse Jobs
                  </a>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}