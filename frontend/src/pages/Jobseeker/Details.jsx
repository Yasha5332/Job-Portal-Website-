import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, userRole } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobAndStatus = async () => {
      setLoading(true);
      try {
        // Fetch Job Details
        const jobRes = await axios.get(`${API_BASE}/api/jobs/${id}`);
        setJob(jobRes.data.job);

        // If logged in as jobseeker, check application status
        if (token && userRole === 'jobseeker') {
          const appsRes = await axios.get(`${API_BASE}/api/applications/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const alreadyApplied = appsRes.data.applications?.some(app => app.job?._id === id);
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndStatus();
  }, [id, token, userRole]);

  const handleApply = async () => {
    if (!token) {
      toast.error('Please login to apply for this job.');
      navigate('/login');
      return;
    }

    if (userRole !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs.');
      return;
    }

    setApplying(true);
    try {
      await axios.post(`${API_BASE}/api/applications`, { jobId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      toast.error(msg);
      if (err.response?.status === 409) setHasApplied(true);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading job details…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error || 'Job not found.'}</p>
          <a href="/jobs" className="text-indigo-600 font-bold hover:underline">Back to Jobs</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50 text-slate-900">
      <main className="px-6 pt-8 mx-auto max-w-5xl">

        {/* Back Button */}
        <a href="/jobs" className="inline-flex items-center gap-2 mb-6 text-sm font-bold transition-colors text-slate-500 hover:text-indigo-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Jobs
        </a>

        {/* ── Job Header Card ─────────────────────────────────────────── */}
        <div className="p-6 mb-8 bg-white border shadow-sm sm:p-8 rounded-3xl border-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex gap-5 sm:gap-6">
              <div className="flex items-center justify-center shrink-0 text-3xl font-bold text-white shadow-sm w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600">
                {job.employer?.company_name?.substring(0, 2).toUpperCase() || 'JB'}
              </div>
              <div>
                <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl text-slate-900">{job.title}</h1>
                <p className="mb-4 font-medium text-slate-600 text-md sm:text-lg">
                  {job.employer?.company_name} <span className="mx-2 text-slate-300">•</span> {job.location}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-lg bg-emerald-50 text-emerald-700">
                    {job.salary_range}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">
                    {job.working_hours}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">
                    {job.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 md:flex-col lg:flex-row">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-3 sm:px-5 sm:py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${isSaved
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleApply}
                disabled={hasApplied || applying}
                className={`px-8 py-3 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${hasApplied
                    ? 'bg-emerald-500 cursor-default'
                    : applying
                      ? 'bg-indigo-400 cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                  }`}
              >
                {applying && (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {hasApplied ? '✓ Applied' : applying ? 'Applying...' : 'Apply Now'}
              </button>
            </div>

          </div>
        </div>

        {/* ── Two-Column Layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Main Content (Left) */}
          <div className="flex flex-col gap-8 lg:col-span-2">

            <section className="p-6 bg-white border shadow-sm sm:p-8 rounded-3xl border-slate-200">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Job Description</h2>
              <p className="leading-relaxed text-slate-600 text-[15px] whitespace-pre-line">
                {job.description}
              </p>
            </section>

          </div>

          {/* Sidebar (Right) */}
          <div className="flex flex-col gap-6 lg:col-span-1">

            {/* Job Summary Card */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="pb-4 mb-4 font-bold border-b text-slate-900 border-slate-100">Job Overview</h3>
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-lg text-slate-400">📅</span>
                  <div>
                    <span className="block font-semibold text-slate-900">Posted</span>
                    <span className="text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg text-slate-400">📍</span>
                  <div>
                    <span className="block font-semibold text-slate-900">Location</span>
                    <span className="text-slate-500">{job.location}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg text-slate-400">⏱</span>
                  <div>
                    <span className="block font-semibold text-slate-900">Working Hours</span>
                    <span className="text-slate-500">{job.working_hours}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Company Info Card */}
            <div className="p-6 border shadow-sm bg-slate-50 rounded-2xl border-slate-200">
              <h3 className="pb-4 mb-4 font-bold border-b text-slate-900 border-slate-200">About the Company</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-lg bg-linear-to-br from-indigo-600 to-purple-600">
                  {job.employer?.company_name?.substring(0, 2).toUpperCase() || 'JB'}
                </div>
                <div>
                  <strong className="block text-slate-900">{job.employer?.company_name}</strong>
                  <span className="text-xs font-medium text-slate-500">Verified Employer</span>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                You are viewing a job from {job.employer?.company_name}. You can contact them at {job.employer?.phone_number || 'the provided contact info'}.
              </p>
              <div className="text-sm font-medium text-slate-500">
                <a href="#" className="font-bold text-indigo-600 hover:underline">View Company Profile →</a>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
