export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-700 pt-16 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">

                    <div className="lg:col-span-2">
                        <div className="inline-block px-3 py-1 mb-4 text-xl font-bold tracking-tight text-white bg-indigo-600 rounded-lg">PTP</div>
                        <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
                            Connecting part-time job seekers with great employers since 2024.
                        </p>
                        <div className="flex gap-4 text-slate-500 text-lg">
                            <a href="#" aria-label="Twitter" className="hover:text-indigo-400 transition-colors">𝕏</a>
                            <a href="#" aria-label="LinkedIn" className="hover:text-indigo-400 transition-colors">in</a>
                            <a href="#" aria-label="Instagram" className="hover:text-indigo-400 transition-colors">⊕</a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-slate-400">
                        <h4 className="text-white font-bold mb-2 text-base">Job Seekers</h4>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Browse Jobs</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Create Profile</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Upload CV</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Job Alerts</a>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-slate-400">
                        <h4 className="text-white font-bold mb-2 text-base">Employers</h4>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Post a Job</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Employer Dashboard</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Resources</a>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-slate-400">
                        <h4 className="text-white font-bold mb-2 text-base">Company</h4>
                        <a href="#" className="hover:text-indigo-400 transition-colors">About Us</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a>
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4 md:gap-0">
                    <p>&copy; 2026 PartTimePro. All rights reserved.</p>
                    <p>Made with ❤️ for flexible workers everywhere.</p>
                </div>
            </div>
        </footer>
    );
}