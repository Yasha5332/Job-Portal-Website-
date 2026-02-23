import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';


// ──────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────────────────────

const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center h-full px-3 text-xs font-medium border-b-2 transition-colors relative ${isActive
        ? 'text-slate-900 border-indigo-600'
        : 'text-slate-500 border-transparent hover:text-slate-900'
    }`;

// ── Badge Component ──
const Badge = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
        <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {count > 9 ? '9+' : count}
        </span>
    );
};

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
    users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-0.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Navbar
// ──────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { userRole, logout, user } = auth;
    const handleSignOut = () => { logout(); navigate('/login'); };

    // Build display data from real auth.user, fall back gracefully
    const displayNameJs = user?.full_name || 'My Account';
    const displayNameEmp = user?.company_name || 'My Company';
    const displayNameAdm = user?.full_name || user?.username || 'Admin User';

    const initialsJs = displayNameJs.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const initialsEmp = displayNameEmp.substring(0, 2).toUpperCase();
    const initialsAdm = displayNameAdm.substring(0, 2).toUpperCase();

    const jobSeekerUser = { name: displayNameJs, initials: initialsJs, title: 'Job Seeker' };
    const employerUser = { name: displayNameEmp, initials: initialsEmp, title: 'Employer Account' };
    const adminUser = { name: displayNameAdm, initials: initialsAdm, title: 'System Administrator' };

    let displayUser = jobSeekerUser;
    if (userRole === 'employer') displayUser = employerUser;
    if (userRole === 'admin') displayUser = adminUser;

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

            {/* ── Left: Logo ── */}
            <div className="flex items-center gap-4">
                <NavLink to="/" className="flex items-center gap-2 group">
                    <div className="flex items-center justify-center px-3 py-2 text-sm font-extrabold tracking-tight text-white bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                        P
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">Proconnect</span>
                </NavLink>
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
                            {Icons.alerts}
                            <Badge count={unreadCount} />
                            <span>Alerts</span>
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
                            {Icons.alerts}
                            <Badge count={unreadCount} />
                            <span>Alerts</span>
                        </NavLink>
                    </>
                )}

                {/* ════════════════ ADMIN ════════════════ */}
                {userRole === 'admin' && (
                    <>
                        <NavLink to="/admin/dashboard" className={navLinkClass}>
                            {Icons.dashboard}<span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={navLinkClass}>
                            {Icons.users}<span>Users</span>
                        </NavLink>
                        <NavLink to="/admin/jobs" className={navLinkClass}>
                            {Icons.shield}<span>Manage Jobs</span>
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

                {/* JOB SEEKER or EMPLOYER or ADMIN → Profile Dropdown */}
                {(userRole === 'jobseeker' || userRole === 'employer' || userRole === 'admin') && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center text-slate-500 transition-colors hover:text-slate-900 focus:outline-none"
                        >
                            <div className={`flex items-center justify-center w-8 h-8 mb-0.5 text-xs font-bold rounded-full ${userRole === 'employer' ? 'bg-emerald-100 text-emerald-700' : userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
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
                                <div className={`flex items-center justify-center w-11 h-11 text-sm font-bold rounded-full ${userRole === 'employer' ? 'bg-emerald-100 text-emerald-700' : userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
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
                                {userRole === 'admin' && (
                                    <>
                                        <NavLink to="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">📊 System Overview</NavLink>
                                        <NavLink to="/admin/users" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">👥 Manage Accounts</NavLink>
                                        <NavLink to="/admin/settings" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">⚙️ System Settings</NavLink>
                                        <NavLink to="/admin/notifications" onClick={() => setIsProfileOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">🔔 Manage Alerts</NavLink>
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