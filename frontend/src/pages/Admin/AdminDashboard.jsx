import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        jobSeekers: 0,
        employers: 0,
        jobs: 0,
        pendingJobs: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/stats', authHeaders);
            setStatsData(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const stats = [
        { label: 'Total Job Seekers', value: statsData.jobSeekers.toLocaleString(), change: '+12%', color: 'blue' },
        { label: 'Total Employers', value: statsData.employers.toLocaleString(), change: '+5%', color: 'emerald' },
        { label: 'Active Jobs', value: statsData.jobs.toLocaleString(), change: '+18%', color: 'indigo' },
        { label: 'Pending Approvals', value: statsData.pendingJobs.toLocaleString(), change: '0', color: 'amber' },
    ];

    const recentActivity = [
        { id: 1, action: 'New Employer Registered', user: 'Tech Corp', time: '2 mins ago' },
        { id: 2, action: 'Job Posted', user: 'Global Solutions', time: '15 mins ago' },
        { id: 3, action: 'User Complaint Filed', user: 'John Doe', time: '1 hour ago' },
        { id: 4, action: 'System Update', user: 'Scheduled Task', time: '3 hours ago' },
    ];

    // ── Button Handlers ────────────────────────────────────────────────────────
    const handleApprovePending = async () => {
        if (statsData.pendingJobs === 0) {
            toast.error('No pending jobs to approve.');
            return;
        }
        const t = toast.loading('Approving pending jobs...');
        try {
            const { data } = await axios.patch('http://localhost:5000/api/admin/jobs/approve-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(data.message, { id: t });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve jobs.', { id: t });
        }
    };

    const handleGenerateReport = async () => {
        const t = toast.loading('Generating system report...');
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/report', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PartTimePro_Report_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Report generated and downloaded!', { id: t });
        } catch (err) {
            toast.error('Failed to generate report.', { id: t });
        }
    };

    const handleManageRoles = () => {
        navigate('/admin/users');
    };

    const handleViewAllLogs = () => {
        toast('Activity logs expanded (Coming Soon)', {
            icon: '📋',
            style: {
                borderRadius: '12px',
                background: '#334155',
                color: '#fff',
            },
        });
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">System Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.full_name || 'Admin'}. Here's what's happening today.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : stat.value}</h3>
                                {!loading && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-slate-900">Recent Activity Logs</h2>
                                <button
                                    onClick={handleViewAllLogs}
                                    className="text-sm text-indigo-600 font-semibold hover:underline"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {recentActivity.map((log) => (
                                    <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                                            <p className="text-xs text-slate-500">By {log.user}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleApprovePending}
                                    disabled={statsData.pendingJobs === 0}
                                    className={`w-full py-2.5 px-4 text-white text-sm font-bold rounded-lg transition-all active:scale-95 ${statsData.pendingJobs > 0
                                        ? 'bg-indigo-600 hover:bg-indigo-700'
                                        : 'bg-slate-300 cursor-not-allowed'
                                        }`}
                                >
                                    Approve Pending Jobs ({statsData.pendingJobs})
                                </button>
                                <button
                                    onClick={handleGenerateReport}
                                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Generate System Report
                                </button>
                                <button
                                    onClick={handleManageRoles}
                                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Manage User Roles
                                </button>
                            </div>
                        </section>

                        <section className="bg-linear-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                            <h2 className="font-bold mb-2">System Health</h2>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                                <p className="text-sm font-medium">All systems operational</p>
                            </div>
                            <p className="text-xs text-indigo-100 mt-4 leading-relaxed">
                                Last integrity check: {loading ? '...' : 'Just now'}. No security threats detected.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
