import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Job from './pages/Jobseeker/Job'
import Navbar from './components/Navbar'
import './App.css'
import Footer from './components/Footer'
import Messages from './pages/Jobseeker/Message'
import Alerts from './pages/Jobseeker/Alerts'
import Applications from './pages/Jobseeker/Application'
import Profile from './pages/Jobseeker/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EmployeeDashboard from './pages/Employer/EmployerDashboard'
import EmployerMyJobs from './pages/Employer/EmployerMyJobs'
import EmployerCandidates from './pages/Employer/EmployerCandidates'
import EmployerMessages from './pages/Employer/EmployerMessages'
import JobDetail from './pages/Jobseeker/Details'
import EmployerAlerts from './pages/Employer/EmployerAlerts'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminJobs from './pages/Admin/AdminJobs'
import AdminSignup from './pages/AdminSignup'
import AdminUsers from './pages/Admin/AdminUsers'

// Pages listed here will NOT show the Navbar or Footer
const noNavbarRoutes = ['/login', '/signup', '/admin/signup']

function App() {
  const location = useLocation()
  const showNavbar = !noNavbarRoutes.includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Job />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/employerAlerts" element={<EmployerAlerts />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/employerMyJobs" element={<EmployerMyJobs />} />
          <Route path="/employerCandidates" element={<EmployerCandidates />} />
          <Route path="/employerMessages" element={<EmployerMessages />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/settings" element={<AdminDashboard />} /> { /* Placeholder */}
          <Route path="/admin/notifications" element={<AdminDashboard />} /> { /* Placeholder */}
        </Routes>
      </main>
      {showNavbar && <Footer />}
    </div>
  )
}

export default App

