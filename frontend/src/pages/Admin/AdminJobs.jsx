import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/jobs');
            setJobs(data.jobs || []);
        } catch (err) {
            setError('Failed to fetch job postings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to remove this job posting?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/jobs/${id}`, config);
            fetchJobs();
        } catch (err) {
            alert('Failed to delete job.');
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Moderation</h1>
                        <p className="text-slate-500 mt-1">Review and manage all job postings across the platform.</p>
                    </div>
                    <button
                        onClick={fetchJobs}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        🔄 Refresh Jobs
                    </button>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Job Title & Company</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category & Location</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jobs.map(job => (
                                    <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-900">{job.title}</p>
                                            <p className="text-xs text-slate-500">{job.employer?.company_name || 'Individual Employer'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-medium text-slate-700">{job.category}</p>
                                            <p className="text-xs text-slate-400 italic">{job.location}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${job.status === 'active' ? 'bg-green-100 text-green-700' :
                                                job.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Delete Posting
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {jobs.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                No job postings found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
