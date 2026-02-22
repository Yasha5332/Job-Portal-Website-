import React, { createContext, useContext, useState, useEffect } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// AuthContext
// Stores: token, userRole, user (profile object)
// All persisted to localStorage so the session survives page refresh.
// ──────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// Map the backend role strings ('job_seeker') to frontend role strings ('jobseeker')
const normaliseRole = (backendRole) => {
    if (backendRole === 'job_seeker') return 'jobseeker';
    if (backendRole === 'employer') return 'employer';
    return 'visitor';
};

const parseUser = (raw) => {
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
};

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('ptp_token') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('ptp_role') || 'visitor');
    const [user, setUser] = useState(() => parseUser(localStorage.getItem('ptp_user')));

    // Sync token to localStorage
    useEffect(() => {
        if (token) localStorage.setItem('ptp_token', token);
        else localStorage.removeItem('ptp_token');
    }, [token]);

    // Sync role to localStorage
    useEffect(() => {
        localStorage.setItem('ptp_role', userRole);
    }, [userRole]);

    // Sync user object to localStorage
    useEffect(() => {
        if (user) localStorage.setItem('ptp_user', JSON.stringify(user));
        else localStorage.removeItem('ptp_user');
    }, [user]);

    /**
     * Call after a successful /api/login or /api/register response.
     * @param {string} newToken   - JWT from the backend
     * @param {string} backendRole - raw role string ('job_seeker' | 'employer')
     * @param {object} userData   - user object returned by the backend
     */
    const login = (newToken, backendRole, userData = null) => {
        setToken(newToken);
        setUserRole(normaliseRole(backendRole));
        setUser(userData);
    };

    // Call when the user clicks "Sign Out"
    const logout = () => {
        setToken(null);
        setUserRole('visitor');
        setUser(null);
        localStorage.removeItem('ptp_token');
        localStorage.removeItem('ptp_role');
        localStorage.removeItem('ptp_user');
    };

    return (
        <AuthContext.Provider value={{ token, userRole, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Convenience hook – use this in every component that needs auth
export const useAuth = () => useContext(AuthContext);
