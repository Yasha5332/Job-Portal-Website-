import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* ── Navbar Component would be imported and placed here ── */}
      
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative px-4 py-20 md:py-28 bg-slate-50 overflow-hidden flex flex-col items-center text-center">
          {/* Decorative background blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              🚀 Over 12,000 jobs posted this month
            </span>
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Find the perfect<br />
              <span className="text-indigo-600">part-time job</span><br />
              for your lifestyle.
            </h1>
            <p className="mb-10 text-lg text-slate-600">
              Flexible hours. Great pay. Real opportunities — matched to you.
            </p>

            {/* Hero Quick Search */}
            <div className="flex flex-col md:flex-row items-center w-full max-w-3xl mx-auto bg-white rounded-3xl md:rounded-full shadow-lg p-2 border border-slate-200">
              <div className="flex items-center flex-1 w-full px-4 py-3 md:py-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Job title, skill, or keyword..." 
                  className="w-full ml-3 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
              <div className="flex items-center flex-1 w-full px-4 py-3 md:py-2 border-t md:border-t-0 border-slate-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <input 
                  type="text" 
                  placeholder="City or Remote..." 
                  className="w-full ml-3 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                />
              </div>
              <button className="w-full md:w-auto mt-2 md:mt-0 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold rounded-full md:rounded-full">
                Search Jobs
              </button>
            </div>

            {/* Popular categories pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10 text-sm">
              <span className="font-medium text-slate-500">Popular:</span>
              <a href="#" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">🛍️ Retail</a>
              <a href="#" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">🍔 Food & Bev</a>
              <a href="#" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">💻 IT & Tech</a>
              <a href="#" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">🎧 Customer Service</a>
              <a href="#" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">🎨 Creative</a>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ─────────────────────────────────────────────────── */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="flex flex-col items-center text-center flex-1">
              <strong className="text-2xl md:text-3xl font-bold text-slate-900">12,400+</strong>
              <span className="text-sm font-medium text-slate-500 mt-1">Active Listings</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <strong className="text-2xl md:text-3xl font-bold text-slate-900">3,200+</strong>
              <span className="text-sm font-medium text-slate-500 mt-1">Employers Hiring</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <strong className="text-2xl md:text-3xl font-bold text-slate-900">48 hrs</strong>
              <span className="text-sm font-medium text-slate-500 mt-1">Avg. Time to Hire</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <strong className="text-2xl md:text-3xl font-bold text-slate-900">94%</strong>
              <span className="text-sm font-medium text-slate-500 mt-1">Applicant Satisfaction</span>
            </div>
          </div>
        </div>

        {/* ── Browse by Category ────────────────────────────────────────── */}
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Categories</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Explore by Job Type</h2>
            <p className="text-lg text-slate-600">Browse thousands of part-time roles across every industry.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#fef3c7', color: '#d97706' }}>🛍️</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Retail</strong>
                <span className="text-sm font-medium text-slate-500">48 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#fce7f3', color: '#db2777' }}>🍔</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Food & Bev</strong>
                <span className="text-sm font-medium text-slate-500">36 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#dbeafe', color: '#2563eb' }}>💻</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">IT & Tech</strong>
                <span className="text-sm font-medium text-slate-500">22 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#d1fae5', color: '#059669' }}>🎧</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Customer Service</strong>
                <span className="text-sm font-medium text-slate-500">61 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#ede9fe', color: '#7c3aed' }}>🎨</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Creative</strong>
                <span className="text-sm font-medium text-slate-500">18 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#fef9c3', color: '#ca8a04' }}>📚</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Education</strong>
                <span className="text-sm font-medium text-slate-500">29 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#ffedd5', color: '#ea580c' }}>📣</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Marketing</strong>
                <span className="text-sm font-medium text-slate-500">17 open roles</span>
              </div>
            </a>
            <a href="#" className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl text-2xl mr-4" style={{ background: '#f0fdf4', color: '#16a34a' }}>📦</div>
              <div className="flex flex-col">
                <strong className="text-lg font-bold text-slate-900">Warehouse</strong>
                <span className="text-sm font-medium text-slate-500">33 open roles</span>
              </div>
            </a>
          </div>
        </section>

        {/* ── Why PartTimePro ───────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Why Us</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Built for job seekers, <br />not just employers.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl text-3xl mb-6" style={{ background: '#ede9fe' }}>🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Filtering</h3>
                <p className="text-slate-600 leading-relaxed">Narrow down by category, location, salary, and hours — find roles that actually fit your life.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl text-3xl mb-6" style={{ background: '#d1fae5' }}>⚡</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">One-Click Apply</h3>
                <p className="text-slate-600 leading-relaxed">Submit applications instantly using your saved profile. Track every application in real-time.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl text-3xl mb-6" style={{ background: '#dbeafe' }}>🔔</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Job Alerts</h3>
                <p className="text-slate-600 leading-relaxed">Set your preferences once and get notified the moment a matching role is posted.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl text-3xl mb-6" style={{ background: '#fef3c7' }}>💼</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">CV Builder</h3>
                <p className="text-slate-600 leading-relaxed">Create a polished, ATS-friendly CV in minutes and upload it directly to your profile.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trusted Companies ─────────────────────────────────────────── */}
        <section className="py-20 px-4 max-w-6xl mx-auto text-center border-b border-slate-200">
          <div className="mb-10">
            <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Partners</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Trusted by great employers</h2>
            <p className="text-slate-600">Join thousands of candidates getting hired at these companies.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['TechCorp', 'Daily Grind', 'RetailPlus', 'EduTutors', 'FreshMarket', 'DesignHub', 'SwiftLogix', 'HelpDesk Pro'].map((company, i) => (
              <div key={i} className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-500 font-bold uppercase tracking-wide text-sm shadow-sm">
                {company}
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Stories</div>
              <h2 className="text-3xl md:text-4xl font-bold">Real people. Real results.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 tracking-widest mb-6">★★★★★</div>
                  <p className="text-slate-300 italic mb-8 leading-relaxed">"I found a weekend barista job within two days of signing up. The filtering was incredible — I only saw roles that actually matched my availability."</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4" style={{ background: '#fce7f3', color: '#db2777' }}>SJ</div>
                  <div>
                    <strong className="block text-white">Sarah J.</strong>
                    <span className="block text-sm text-slate-400">University Student</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 tracking-widest mb-6">★★★★★</div>
                  <p className="text-slate-300 italic mb-8 leading-relaxed">"The job alerts are a game changer. I set my preferences on Monday and had three interviews lined up by Friday. Landed a remote support role."</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4" style={{ background: '#dbeafe', color: '#2563eb' }}>AT</div>
                  <div>
                    <strong className="block text-white">Alex T.</strong>
                    <span className="block text-sm text-slate-400">Freelancer & Remote Worker</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 tracking-widest mb-6">★★★★★</div>
                  <p className="text-slate-300 italic mb-8 leading-relaxed">"Tracking my application status took away all the anxiety of job hunting. I could see exactly where I was in the process at all times."</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4" style={{ background: '#d1fae5', color: '#059669' }}>DM</div>
                  <div>
                    <strong className="block text-white">David M.</strong>
                    <span className="block text-sm text-slate-400">Recent Graduate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto bg-indigo-600 text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl shadow-indigo-200">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your next opportunity?</h2>
            <p className="text-lg md:text-xl text-indigo-100">Join over 50,000 job seekers already using PartTimePro.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <a href="#" className="bg-white text-indigo-600 hover:bg-slate-50 transition-colors px-8 py-4 rounded-full font-bold text-lg">
                Browse All Jobs
              </a>
              <a href="#" className="border-2 border-indigo-300 hover:border-white transition-colors text-white px-8 py-4 rounded-full font-bold text-lg">
                Upload Your CV
              </a>
            </div>
          </div>
        </section>

      </main>

     
    </div>
  );
}