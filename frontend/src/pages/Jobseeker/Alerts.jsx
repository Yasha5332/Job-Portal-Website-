import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

// ── Demo Alerts — shown when DB is empty ─────────────────────────────────────
const DEMO_ALERTS = [
  {
    _id: 'demo-1',
    type: 'status',
    is_read: false,
    title: 'TechCorp HR',
    message: 'reviewed your application for <strong>Customer Support Representative</strong>. They want to schedule an interview!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    _id: 'demo-2',
    type: 'jobs',
    is_read: false,
    title: 'New job match',
    message: '<strong>Weekend Barista</strong> at <strong>Daily Grind Coffee House</strong> — $12/hr · Near you',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    _id: 'demo-3',
    type: 'jobs',
    is_read: true,
    title: 'Job match summary',
    message: '3 new jobs in <strong>IT & Tech</strong> matching your profile were posted today.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
  },
  {
    _id: 'demo-4',
    type: 'system',
    is_read: true,
    title: 'System Maintenance',
    message: 'PartTimePro will be unavailable for 2 hours this Sunday at 2:00 AM EST.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

// ── Icon map by notification type ────────────────────────────────────────────
const TYPE_CONFIG = {
  status: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  jobs: {
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  system: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

// ── Human-readable relative time ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 86400 * 2) return 'Yesterday';
  if (secs < 86400 * 7) return `${Math.floor(secs / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Alerts() {
  const { token } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // ── Fetch — falls back to demo data when empty ───────────────────────────────
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const { data } = await axios.get(`${API_BASE}/api/notifications`, authHeaders);
      const real = data.notifications || [];
      if (real.length > 0) {
        setAlerts(real);
        setIsDemo(false);
      } else {
        setAlerts(DEMO_ALERTS);
        setIsDemo(true);
      }
    } catch {
      setAlerts(DEMO_ALERTS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── Mark one as read ─────────────────────────────────────────────────────────
  const handleCardClick = async (id) => {
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, is_read: true } : a));
    if (isDemo) return;
    try {
      await axios.patch(`${API_BASE}/api/notifications/${id}/read`, {}, authHeaders);
    } catch { /* optimistic update stays */ }
  };

  // ── Mark all as read ─────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    if (isDemo) return;
    try {
      await axios.patch(`${API_BASE}/api/notifications/read-all`, {}, authHeaders);
    } catch { /* optimistic update stays */ }
  };

  // ── Dismiss ──────────────────────────────────────────────────────────────────
  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a._id !== id));
    if (isDemo) return;
    try {
      await axios.delete(`${API_BASE}/api/notifications/${id}`, authHeaders);
    } catch { /* already removed from UI */ }
  };

  // ── Filter tabs ──────────────────────────────────────────────────────────────
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'unread') return !alert.is_read;
    if (activeTab === 'jobs') return alert.type === 'jobs';
    if (activeTab === 'status') return alert.type === 'status';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <main className="max-w-3xl mx-auto px-4 pt-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
              {loading ? '…' : unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
            </span>
          </div>

          {/* ── Demo banner ── */}
          {!loading && isDemo && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold sm:self-center">
              <span>🎭 Demo Mode</span>
            </div>
          )}

          {!loading && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6 pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'jobs', label: 'Job Matches' },
            { id: 'status', label: 'Status Updates' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            <p className="font-semibold mb-2">⚠️ {fetchErr}</p>
            <button onClick={fetchAlerts} className="text-sm underline hover:text-red-900">Retry</button>
          </div>
        )}

        {/* Alert cards */}
        {!loading && !fetchErr && (
          <div className="flex flex-col gap-4">
            {filteredAlerts.length > 0 ? filteredAlerts.map(alert => {
              const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.system;
              return (
                <div
                  key={alert._id}
                  onClick={() => handleCardClick(alert._id)}
                  className={`relative flex gap-4 p-5 md:p-6 bg-white border border-slate-200 rounded-2xl transition-all cursor-pointer hover:border-indigo-300 hover:shadow-md ${!alert.is_read ? 'bg-indigo-50/30' : ''
                    }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] leading-relaxed text-slate-700 mb-3 pr-6">
                      {alert.title && <strong>{alert.title}: </strong>}
                      <span dangerouslySetInnerHTML={{ __html: alert.message }} />
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {timeAgo(alert.createdAt)}
                      </span>

                      <div className="flex gap-2">
                        {alert.type === 'jobs' && (
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                            View Job
                          </button>
                        )}
                        {alert.type === 'status' && (
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                            View Details
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDismiss(e, alert._id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!alert.is_read && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-600 rounded-full" />
                  )}
                </div>
              );
            }) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-2xl text-3xl mb-4">🔔</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
                <p className="text-slate-500 max-w-sm">No notifications here. We'll let you know when something happens.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}