import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

// ── Demo Jobs — shown when DB is empty ───────────────────────────────────────
const DEMO_JOBS = [
  {
    _id: 'demo-1',
    title: "Customer Support Representative",
    description: "Handle client inquiries during weekend shifts. Must be patient and articulate.",
    category: "customer-service",
    location: "Remote",
    salary_range: "$15/hr",
    working_hours: "Part-time",
    employer: { company_name: "TechCorp" },
  },
  {
    _id: 'demo-2',
    title: "Junior Web Developer",
    description: "Build and maintain landing pages using React. Basic Git knowledge required.",
    category: "it",
    location: "Downtown (Hybrid)",
    salary_range: "$20/hr",
    working_hours: "Flexible",
    employer: { company_name: "Startup Hub" },
  },
  {
    _id: 'demo-3',
    title: "Weekend Barista",
    description: "Espresso machine experience preferred. Morning shifts available.",
    category: "food-beverage",
    location: "Center City",
    salary_range: "$12/hr",
    working_hours: "Weekends",
    employer: { company_name: "Daily Grind Coffee" },
  },
  {
    _id: 'demo-4',
    title: "Retail Sales Associate",
    description: "Assist customers and manage stock during busy mall hours.",
    category: "retail",
    location: "Mall District",
    salary_range: "$13/hr",
    working_hours: "Evenings",
    employer: { company_name: "Urban Outfitters" },
  },
  {
    _id: 'demo-5',
    title: "Social Media Manager",
    description: "Manage Instagram and TikTok accounts for local brands.",
    category: "marketing",
    location: "Remote",
    salary_range: "$18/hr",
    working_hours: "Part-time",
    employer: { company_name: "Bright Agency" },
  },
  {
    _id: 'demo-6',
    title: "Warehouse Picker",
    description: "Organize and pack shipments in a fast-paced environment.",
    category: "warehouse",
    location: "Industrial Park",
    salary_range: "$14/hr",
    working_hours: "Night Shift",
    employer: { company_name: "QuickShip Logistics" },
  }
];

// ── Helper: Format category string to human readable label ────────────────────
const formatCategoryLabel = (str) => {
  if (!str) return 'Other';
  return str
    .split(/[-_/\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function Jobs() {
  const navigate = useNavigate();
  const { token, userRole } = useAuth();

  // ── Remote data ─────────────────────────────────────────────────────────────
  const [allJobs, setAllJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');

  // ── Derived Categories ──────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const uniqueVals = Array.from(new Set(allJobs.map(j => j.category).filter(Boolean))).sort();
    return uniqueVals.map(val => ({
      value: val,
      label: formatCategoryLabel(val)
    }));
  }, [allJobs]);

  // ── Filter inputs ───────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  // ── Fetch jobs from backend — falls back to demo when empty ──────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const { data } = await axios.get(`${API_BASE}/api/jobs`);
      const real = data.jobs || [];
      if (real.length > 0) {
        setAllJobs(real);
        setIsDemo(false);
      } else {
        setAllJobs(DEMO_JOBS);
        setIsDemo(true);
      }
    } catch {
      setAllJobs(DEMO_JOBS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch User's Applications ────────────────────────────────────────────────
  const fetchMyApplications = useCallback(async () => {
    if (!token || userRole !== 'jobseeker') return;
    try {
      const { data } = await axios.get(`${API_BASE}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set(data.applications.map(app => app.job?._id));
      setAppliedJobIds(ids);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  }, [token, userRole]);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [fetchJobs, fetchMyApplications]);

  // ── Handle Direct Apply ──────────────────────────────────────────────────────
  const handleApplyDirect = async (jobId) => {
    if (!token) {
      toast.error('Please login to apply.');
      navigate('/login');
      return;
    }
    if (userRole !== 'jobseeker') {
      toast.error('Only job seekers can apply.');
      return;
    }

    setApplyingId(jobId);
    try {
      await axios.post(`${API_BASE}/api/applications`, { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedJobIds(prev => new Set([...prev, jobId]));
      toast.success('Applied successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Application failed.';
      toast.error(msg);
      if (err.response?.status === 409) {
        setAppliedJobIds(prev => new Set([...prev, jobId]));
      }
    } finally {
      setApplyingId(null);
    }
  };

  // ── Filter helpers ───────────────────────────────────────────────────────────
  const handleCategoryClick = (val) => {
    setCategory(prev => prev === val ? '' : val);
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setCategory('');
  };

  // ── Client-side filter on fetched data ──────────────────────────────────────
  const filteredJobs = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const l = location.trim().toLowerCase();

    // Split search into words for more flexible matching (e.g., "developer web")
    const searchTerms = k.split(/\s+/).filter(t => t.length > 0);

    return allJobs.filter(job => {
      const title = String(job.title || '').toLowerCase();
      const desc = String(job.description || '').toLowerCase();
      const company = String(job.employer?.company_name || '').toLowerCase();
      const catLabel = categories.find(c => c.value === job.category)?.label?.toLowerCase() || '';

      // 1. Keyword Match (Job must contain ALL search words in at least one field)
      const matchesKeyword = searchTerms.length === 0 || searchTerms.every(term =>
        title.includes(term) ||
        desc.includes(term) ||
        company.includes(term) ||
        catLabel.includes(term)
      );

      // 2. Location Match
      const loc = String(job.location || '').toLowerCase();
      const matchesLocation = !l || loc.includes(l);

      // 3. Category Match (Strict value matching)
      const matchesCategory = !category || job.category === category;

      return matchesKeyword && matchesLocation && matchesCategory;
    });
  }, [allJobs, keyword, location, category]);

  const isFiltered = !!(keyword.trim() || location.trim() || category);
  const remoteCount = allJobs.filter(j => j.location?.toLowerCase().includes('remote')).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      <main className="max-w-[960px] mx-auto px-4 pt-12">

        {/* ── Search Bar ── */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-800">Find your next part-time opportunity</h2>
            {!loading && isDemo && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold">
                <span>🎭 Demo Mode</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Keywords (e.g., React, TechCorp)..."
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                placeholder="Location (e.g., Remote)..."
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <select
              className="flex-1 min-w-[180px] p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base bg-white cursor-pointer"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter pills */}
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Filters</span>
              {keyword.trim() && <FilterPill label={`"${keyword}"`} onRemove={() => setKeyword('')} />}
              {location.trim() && <FilterPill label={`📍 ${location}`} onRemove={() => setLocation('')} />}
              {category && <FilterPill label={categories.find(c => c.value === category)?.label} onRemove={() => setCategory('')} />}
              <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold ml-1 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* ── Two-Column Layout ── */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-1/4 flex flex-col gap-6">

            {/* Browse by Category */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="flex items-center text-base font-bold text-slate-900 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Browse Categorized
              </h4>
              <div className="flex flex-col gap-1 text-sm">
                {categories.map(c => {
                  const count = allJobs.filter(j => j.category === c.value).length;
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleCategoryClick(c.value)}
                      className={`text-left px-2 py-1.5 rounded-md transition-all ${category === c.value
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                        }`}
                    >
                      {c.label}
                      <span className={`ml-1 text-[10px] font-bold ${category === c.value ? 'text-indigo-200' : 'text-slate-400'}`}>({count})</span>
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-slate-400 italic px-2 py-4">No categories available</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="text-base font-bold text-slate-900 mb-4">📊 Quick Stats</h4>
              <ul className="flex flex-col gap-3 text-sm">
                <li className="flex justify-between border-b border-slate-100 pb-2 text-slate-600">
                  <span>Total Listings</span>
                  <strong className="text-slate-900">{loading ? '—' : allJobs.length}</strong>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-2 text-slate-600">
                  <span>Remote Jobs</span>
                  <strong className="text-slate-900">{loading ? '—' : remoteCount}</strong>
                </li>
                <li className="flex justify-between text-slate-600">
                  <span>Showing</span>
                  <strong className="text-slate-900">{loading ? '—' : filteredJobs.length}</strong>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="text-base font-bold text-slate-900 mb-4">💡 Job Tips</h4>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-slate-600">
                <li>Tailor your CV to each role</li>
                <li>Apply within the first 24 hours</li>
                <li>Follow up after 1 week</li>
                <li>Highlight flexible availability</li>
              </ul>
            </div>
          </aside>

          {/* Results */}
          <section className="w-full md:w-3/4">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {isFiltered ? 'Search Results' : 'Recent Postings'}
              </h3>
              {!loading && (
                <span className="text-sm text-slate-500">
                  Showing {filteredJobs.length} of {allJobs.length} results
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3 mb-6" />
                    <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                ))}
              </div>
            )}

            {/* Fetch error */}
            {!loading && fetchErr && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                <p className="font-semibold mb-2">⚠️ {fetchErr}</p>
                <button onClick={fetchJobs} className="text-sm underline hover:text-red-900">
                  Retry
                </button>
              </div>
            )}

            {/* No results */}
            {!loading && !fetchErr && filteredJobs.length === 0 && (
              <div className="bg-white p-10 rounded-lg border border-slate-200 text-center">
                <p className="text-4xl mb-3">{allJobs.length === 0 ? '📭' : '🔍'}</p>
                <p className="font-semibold text-slate-800 mb-1">
                  {allJobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}
                </p>
                <p className="text-sm text-slate-500">
                  {allJobs.length === 0
                    ? 'Check back later — employers will post new opportunities soon.'
                    : 'Try adjusting your search terms or clearing the filters.'}
                </p>
                {isFiltered && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-indigo-600 hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Job cards */}
            {!loading && !fetchErr && filteredJobs.length > 0 && (
              <div className="flex flex-col gap-4">
                {filteredJobs.map(job => (
                  <div key={job._id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">{job.title}</h4>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          {job.employer?.company_name || 'Company'} &bull; {job.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                        {job.salary_range && (
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wide">
                            {job.salary_range}
                          </span>
                        )}
                        {job.working_hours && (
                          <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-blue-50 text-blue-600">
                            {job.working_hours}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {categories.find(c => c.value === job.category)?.label || formatCategoryLabel(job.category)}
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed mb-6">{job.description}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-5 py-2 rounded-md transition-colors"
                      >
                        See More
                      </button>
                      <button
                        onClick={() => handleApplyDirect(job._id)}
                        disabled={appliedJobIds.has(job._id) || applyingId === job._id || isDemo}
                        className={`font-medium px-5 py-2 rounded-md transition-colors flex items-center gap-2 ${appliedJobIds.has(job._id)
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : applyingId === job._id
                            ? 'bg-indigo-400 text-white cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                      >
                        {applyingId === job._id && (
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {appliedJobIds.has(job._id) ? '✓ Applied' : applyingId === job._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-indigo-900 ml-0.5 font-bold">✕</button>
    </span>
  );
}