import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/login`, formData);

      // Store token, role, and user profile in context (persisted to localStorage)
      auth.login(data.token, data.role, data.user);

      // Redirect based on role
      navigate(data.role === 'employer' ? '/employeeDashboard' : '/');

    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Could not connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md p-10 bg-white border shadow-xl border-slate-200 rounded-3xl">

        {/* Header / Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-5 text-base font-extrabold tracking-tight text-white bg-indigo-600 rounded-2xl shadow-md shadow-indigo-200">
            PTP
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2.5 text-[15px] text-slate-500 font-normal leading-relaxed">
            Enter your credentials to access your account.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[14px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-[13px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full px-4 py-3.5 text-[15px] transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white text-slate-900 placeholder-slate-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Password</label>
              <a href="#" className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-3.5 text-[15px] transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white text-slate-900 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-3 text-[15px] font-bold text-white transition-all bg-indigo-600 shadow-md shadow-indigo-200 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-[14px] text-center text-slate-500">
          Don't have an account?{' '}
          <a href="/signup" className="font-bold text-indigo-600 transition-colors hover:text-indigo-800">
            Sign up for free
          </a>
        </p>
      </div>
    </div>
  );
}