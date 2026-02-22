import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


// ──────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────────────────────

const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center h-full px-3 text-xs font-medium border-b-2 transition-colors ${isActive
        ? 'text-slate-900 border-indigo-600'
        : 'text-slate-500 border-transparent hover:text-slate-900'
    }`;

// SVG icon set — keeps JSX below clean
const Icons = {
    home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    jobs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    messages: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    alerts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    applications: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    myJobs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>,
    candidates: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    chevronDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Navbar
// ──────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { userRole, logout, user } = auth;
    const handleSignOut = () => { logout(); navigate('/login'); };

    // Build display data from real auth.user, fall back gracefully
    const displayNameJs = user?.full_name || 'My Account';
    const displayNameEmp = user?.company_name || 'My Company';
    const initialsJs = displayNameJs.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const initialsEmp = displayNameEmp.substring(0, 2).toUpperCase();
    const jobSeekerUser = { name: displayNameJs, initials: initialsJs, title: 'Job Seeker' };
    const employerUser = { name: displayNameEmp, initials: initialsEmp, title: 'Employer Account' };
    const displayUser = userRole === 'employer' ? employerUser : jobSeekerUser;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between h-[72px] px-6 bg-white border-b border-slate-200">

            {/* ── Left: Logo + Search ── */}
            <div className="flex items-center gap-4">
                <NavLink to="/" className="flex items-center justify-center px-3 py-2 text-sm font-extrabold tracking-tight text-white bg-indigo-600 rounded-lg">
                    PTP
                </NavLink>
                <div className="flex items-center w-72 px-4 py-2 transition-all duration-300 bg-slate-100 border border-transparent rounded-md focus-within:w-80 focus-within:bg-white focus-within:border-indigo-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 mr-2 shrink-0">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search jobs, skills, companies..."
                        className="w-full text-sm bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
                    />
                </div>
            </div>

            {/* ── Center: Role-specific Nav Links ── */}
            <nav className="hidden h-full gap-0 md:flex">

                {/* ════════════════ VISITOR ════════════════ */}
                {userRole === 'visitor' && (
                    <>
                        <NavLink to="/" end className={navLinkClass}>
                            {Icons.home}<span>Home</span>
                        </NavLink>
                        <NavLink to="/jobs" className={navLinkClass}>
                            {Icons.jobs}<span>Find Jobs</span>
                        </NavLink>
                    </>
                )}

                {/* ════════════════ JOB SEEKER ════════════════ */}
                {userRole === 'jobseeker' && (
                    <>
                        <NavLink to="/" end className={navLinkClass}>
                            {Icons.home}<span>Home</span>
                        </NavLink>
                        <NavLink to="/jobs" className={navLinkClass}>
                            {Icons.jobs}<span>Find Jobs</span>
                        </NavLink>
                        <NavLink to="/alerts" className={navLinkClass}>
                            {Icons.alerts}<span>Alerts</span>
                        </NavLink>
                        <NavLink to="/applications" className={navLinkClass}>
                            {Icons.applications}<span>Applications</span>
                        </NavLink>
                    </>
                )}

                {/* ════════════════ EMPLOYER ════════════════ */}
                {userRole === 'employer' && (
                    <>
                        <NavLink to="/employeeDashboard" className={navLinkClass}>
                            {Icons.dashboard}<span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/employerMyJobs" className={navLinkClass}>
                            {Icons.myJobs}<span>My Jobs</span>
                        </NavLink>
                        <NavLink to="/employerCandidates" className={navLinkClass}>
                            {Icons.candidates}<span>Candidates</span>
                        </NavLink>
                        <NavLink to="/employerAlerts" className={navLinkClass}>
                            {Icons.alerts}<span>Alerts</span>
                        </NavLink>
                    </>
                )}

            </nav>

            {/* ── Right: Auth-aware actions ── */}
            <div className="flex items-center gap-3">

                {/* VISITOR → Login / Sign Up buttons */}
                {userRole === 'visitor' && (
                    <>
                        <NavLink
                            to="/login"
                            className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/signup"
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Sign Up
                        </NavLink>
                    </>
                )}

                {/* JOB SEEKER or EMPLOYER → Profile Dropdown */}
                {(userRole === 'jobseeker' || userRole === 'employer') && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center text-slate-500 transition-colors hover:text-slate-900 focus:outline-none"
                        >
                            <div className={`flex items-center justify-center w-8 h-8 mb-0.5 text-xs font-bold rounded-full ${userRole === 'employer' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {displayUser.initials}
                            </div>
                            <span className="flex items-center text-xs gap-0.5">
                                {Icons.chevronDown}
                            </span>
                        </button>

                        {/* Dropdown panel */}
                        <div className={`absolute right-0 top-14 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden transition-all duration-200 ease-out ${isProfileOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>

                            {/* User identity header */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50">
                                <div className={`flex items-center justify-center w-11 h-11 text-sm font-bold rounded-full ${userRole === 'employer' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {displayUser.initials}
                                </div>
                                <div>
                                    <strong className="block text-[15px] font-bold text-slate-900 leading-tight">{displayUser.name}</strong>
                                    <p className="text-[12px] text-slate-400 mt-0.5">{displayUser.title}</p>
                                </div>
                            </div>

                            {/* Role-specific dropdown links */}
                            <div className="flex flex-col py-1.5">
                                {userRole === 'jobseeker' && (
                                    <>
                                        <NavLink to="/profile" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">👤 View Profile</NavLink>
                                        <NavLink to="/applications" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">📄 My Applications</NavLink>
                                        <NavLink to="/saved-jobs" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">📌 Saved Jobs</NavLink>
                                        <NavLink to="/alerts" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">🔔 Job Alerts</NavLink>
                                    </>
                                )}
                                {userRole === 'employer' && (
                                    <>
                                        <NavLink to="/employeeDashboard" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">📊 Dashboard</NavLink>
                                        <NavLink to="/employerMyJobs" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">💼 My Job Postings</NavLink>
                                        <NavLink to="/employerCandidates" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">👥 Candidates</NavLink>
                                    </>
                                )}
                            </div>

                            {/* Sign out */}
                            <div className="border-t border-slate-100 py-1.5">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                    🚪 Sign Out
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </header>
    );
}