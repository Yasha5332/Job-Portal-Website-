import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('jobseekers');
    const [jobseekers, setJobseekers] = useState([]);
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jsRes, empRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/jobseekers', config),
                axios.get('http://localhost:5000/api/admin/employers', config)
            ]);
            setJobseekers(jsRes.data);
            setEmployers(empRes.data);
        } catch (err) {
            setError('Failed to fetch user data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user and their profile? This action cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 mt-1">Oversee and manage system job seekers and employers.</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        🔄 Refresh List
                    </button>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="flex gap-1 p-1 bg-slate-200 w-fit rounded-xl mb-8">
                    <button
                        onClick={() => setActiveTab('jobseekers')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'jobseekers'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Job Seekers ({jobseekers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('employers')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'employers'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Employers ({employers.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">User Identification</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Background</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Account Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeTab === 'jobseekers' ? (
                                    jobseekers.map(js => (
                                        <tr key={js._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                        {js.full_name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{js.full_name}</p>
                                                        <p className="text-xs text-slate-400 italic">DOB: {js.dob ? new Date(js.dob).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-600 font-medium">{js.user?.email}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{js.address || 'No Address'}</p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {(js.skills || '').split(',').map((skill, i) => skill.trim() && (
                                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-600 font-medium">
                                                    Joined: {js.user?.createdAt ? new Date(js.user.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(js.user?._id)}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Delete Account
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    employers.map(emp => (
                                        <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                                        {emp.company_name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{emp.company_name}</p>
                                                        <p className="text-xs text-slate-400">Phone: {emp.phone_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <p className="text-sm text-slate-600 font-medium">{emp.user?.email || 'No Email'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-600 font-medium">
                                                    Joined: {emp.user?.createdAt ? new Date(emp.user.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Verified Partner</span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(emp.user?._id)}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Delete Account
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {((activeTab === 'jobseekers' && jobseekers.length === 0) || (activeTab === 'employers' && employers.length === 0)) && (
                            <div className="p-12 text-center">
                                <p className="text-slate-400 text-sm">No users found in this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
