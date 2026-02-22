import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function Signup() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('job_seeker');

    // All fields kept in one object; only the relevant ones are sent per role
    const [formData, setFormData] = useState({
        // User table
        email: '',
        password: '',
        // JobSeeker table
        fullName: '',
        phoneNumber: '',
        address: '',
        skills: '',
        // Employer table
        companyName: '',
        empPhone: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Reset role-specific fields when switching so stale data
    // never reaches the wrong DB collection
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setFormData((prev) => ({
            ...prev,
            fullName: '', phoneNumber: '', address: '', skills: '',
            companyName: '', empPhone: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Build the payload matching what authController expects
            const body = {
                email: formData.email,
                password: formData.password,
                role,
                ...(role === 'job_seeker' ? {
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber,
                    address: formData.address,
                    skills: formData.skills,
                } : {
                    company_name: formData.companyName,
                    phone_number: formData.empPhone,
                }),
            };

            const { data } = await axios.post(`http://localhost:5000/api/register`, body);

            auth.login(data.token, data.role, data.user);
            navigate(data.role === 'employer' ? '/employeeDashboard' : '/');

        } catch (err) {
            const msg = err.response?.data?.message;
            setError(msg || 'Could not connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Shared input class
    const inputCls = "w-full px-4 py-3.5 text-[15px] transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white text-slate-900 placeholder-slate-400";
    const labelCls = "block mb-2 text-[13px] font-bold uppercase tracking-widest text-slate-400";

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 py-10">
            <div className="w-full max-w-md p-10 bg-white border shadow-xl border-slate-200 rounded-3xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-5 text-base font-extrabold tracking-tight text-white bg-indigo-600 rounded-2xl shadow-md shadow-indigo-200">
                        PTP
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create an account</h2>
                    <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
                        Join PartTimePro to find your next opportunity.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[14px] text-red-600 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* ── Role Selector ── */}
                    <div>
                        <p className="mb-2.5 text-[13px] font-bold uppercase tracking-widest text-slate-400">I am a</p>
                        <div className="flex gap-3">
                            {[
                                { value: 'job_seeker', label: 'Job Seeker', emoji: '🧑‍💻' },
                                { value: 'employer', label: 'Employer', emoji: '🏢' },
                            ].map(({ value, label, emoji }) => (
                                <label
                                    key={value}
                                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 border-2 rounded-xl cursor-pointer transition-all ${role === value
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="radio" name="role" value={value}
                                        checked={role === value}
                                        onChange={() => handleRoleChange(value)}
                                        className="hidden"
                                    />
                                    <span className="text-xl">{emoji}</span>
                                    <span className="text-[14px] font-bold">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
                            {role === 'job_seeker' ? 'Your Details' : 'Company Details'}
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* ══════════════ JOB SEEKER FIELDS ══════════════ */}
                    {role === 'job_seeker' && (
                        <>
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName}
                                    required placeholder="John Doe"
                                    onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Phone Number</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber}
                                    placeholder="+95 9xxxxxxxxx"
                                    onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Address</label>
                                <input type="text" name="address" value={formData.address}
                                    placeholder="Yangon, Myanmar"
                                    onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Skills</label>
                                <input type="text" name="skills" value={formData.skills}
                                    placeholder="e.g. React, Node.js, Photoshop"
                                    onChange={handleChange} className={inputCls} />
                                <p className="mt-1.5 text-[12px] text-slate-400">Separate skills with commas</p>
                            </div>
                        </>
                    )}

                    {/* ══════════════ EMPLOYER FIELDS ══════════════ */}
                    {role === 'employer' && (
                        <>
                            <div>
                                <label className={labelCls}>Company Name</label>
                                <input type="text" name="companyName" value={formData.companyName}
                                    required placeholder="TechCorp Inc."
                                    onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Company Phone</label>
                                <input type="tel" name="empPhone" value={formData.empPhone}
                                    placeholder="+95 9xxxxxxxxx"
                                    onChange={handleChange} className={inputCls} />
                            </div>
                        </>
                    )}

                    {/* ── Divider ── */}
                    <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Account</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* ── Email ── */}
                    <div>
                        <label className={labelCls}>Email Address</label>
                        <input type="email" name="email" value={formData.email}
                            required placeholder="you@example.com"
                            onChange={handleChange} className={inputCls} />
                    </div>

                    {/* ── Password ── */}
                    <div>
                        <label className={labelCls}>Password</label>
                        <input type="password" name="password" value={formData.password}
                            required placeholder="••••••••"
                            onChange={handleChange} className={inputCls} />
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 text-[15px] font-bold text-white transition-all bg-indigo-600 shadow-md shadow-indigo-200 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-[14px] text-center text-slate-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-bold text-indigo-600 transition-colors hover:text-indigo-800">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}