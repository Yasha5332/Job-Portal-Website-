import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

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
  return new Date(dateStr).toLocaleDateString();
}

export default function EmployerAlerts() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const prevNotifsRef = useRef([]);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newNotifs = response.data.notifications || [];

      // Check for real new notifications to show toast
      if (isSilent && prevNotifsRef.current.length > 0) {
        const brandNew = newNotifs.filter(n => !prevNotifsRef.current.some(p => p._id === n._id));

        brandNew.forEach(n => {
          toast.success(n.title, {
            icon: n.type === 'jobs' ? '📄' : n.type === 'status' ? '📅' : '⚠️',
            style: { borderRadius: '12px', background: '#334155', color: '#fff', fontSize: '14px' }
          });
        });
      }

      setNotifications(newNotifs);
      prevNotifsRef.current = newNotifs;
    } catch (err) {
      if (!isSilent) setError(err.response?.data?.message || err.message || 'Failed to fetch notifications.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleSendTestNotif = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/notifications`, {
        title: 'Test Notification 🚀',
        message: 'This is a successful <strong>CRUD</strong> test for notification creation.',
        type: 'system',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => [response.data.notification, ...prev]);
      toast.success('Test notification sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification dismissed');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleActionClick = async (notif) => {
    if (!notif.is_read) await handleMarkRead(notif._id);
    if (notif.type === 'jobs') window.location.href = '/employerCandidates';
    else if (notif.type === 'system') window.location.href = '/employerDashboard';
  };

  const filteredNotifs = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading notifications…</p>
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
          <button onClick={() => fetchNotifications()} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster position="top-right" />
      <main className="max-w-3xl mx-auto px-6 pt-10">

        <div className="flex justify-between items-end mb-8 text-center sm:text-left">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Stay updated on your hiring process.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSendTestNotif}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              🚀 Send Test Notification
            </button>
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Unread
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredNotifs.map(notif => {
            const isRead = notif.is_read;
            const type = notif.type; // 'jobs', 'status', 'system'
            const bgColor = type === 'jobs' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              type === 'status' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-slate-50 text-slate-600 border-slate-100';

            return (
              <div
                key={notif._id}
                onClick={() => !isRead && handleMarkRead(notif._id)}
                className={`p-5 rounded-2xl border transition-all flex gap-4 relative group ${!isRead ? 'bg-white border-indigo-200 shadow-sm cursor-pointer hover:border-indigo-400' : 'bg-slate-50/50 border-slate-200'}`}
              >

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl border shadow-sm ${bgColor}`}>
                  {type === 'jobs' ? '📄' : type === 'status' ? '📅' : '⚠️'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className={`text-base truncate pr-6 ${!isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{notif.title}</h3>
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mt-1">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3" dangerouslySetInnerHTML={{ __html: notif.message }}></p>

                  {(type === 'jobs' || type === 'system') && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleActionClick(notif); }}
                        className={`px-4 py-2 ${type === 'jobs' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'} text-xs font-bold rounded-lg transition-colors`}
                      >
                        {type === 'jobs' ? 'Review Applications' : 'Go to Dashboard'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!isRead && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-1 shrink-0"></div>}
                  <button
                    onClick={(e) => handleDismiss(e, notif._id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Dismiss"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
          {filteredNotifs.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl grayscale opacity-50">
                🔔
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h2>
              <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed px-6">
                {filter === 'unread'
                  ? 'There are no unread alerts at the moment.'
                  : "When candidates apply to your jobs or your dashboard needs attention, you'll see those alerts here in real-time."}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

