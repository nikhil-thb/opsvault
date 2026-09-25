import ErrorBoundary from "./ErrorBoundary";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Problems from './Problems';
import ProblemDetail from './ProblemDetail';
import ProblemForm from './ProblemForm';
import AdminUsers from './AdminUsers';
import ProfileDropdown from './ProfileDropdown';
import { LogOut, Home, Briefcase, AlertCircle, Users, Zap } from 'lucide-react';

function Layout({ user }: { user: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  const desktopNavItemClass = (path: string) => {
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return active
      ? "text-teal-700 border-teal-600 bg-teal-50/50 inline-flex items-center border-b-2 px-4 pt-1 text-sm font-semibold transition-colors"
      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50/50 inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium transition-colors";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans selection:bg-teal-200 selection:text-teal-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center gap-2.5 mr-6">
                <div className="bg-teal-600 p-1.5 rounded-xl shadow-sm border border-teal-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 tracking-tight">OpsVault</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-1">
                <Link to="/" className={desktopNavItemClass('/')}><Home className="w-4 h-4 mr-2" /> Dashboard</Link>
                <Link to="/projects" className={desktopNavItemClass('/projects')}><Briefcase className="w-4 h-4 mr-2" /> Projects</Link>
                <Link to="/problems" className={desktopNavItemClass('/problems')}><AlertCircle className="w-4 h-4 mr-2" /> Incidents</Link>
                {user.role === 'ORG_ADMIN' && (
                  <Link to="/admin/users" className={desktopNavItemClass('/admin/users')}><Users className="w-4 h-4 mr-2" /> Users</Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/projects" element={<Projects user={user} />} />
                <Route path="/problems" element={<Problems user={user} />} />
                <Route path="/problems/new" element={<ProblemForm user={user} />} />
                <Route path="/problems/:id" element={<ProblemDetail user={user} />} />
                {user.role === 'ORG_ADMIN' && <Route path="/admin/users" element={<AdminUsers />} />}
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-teal-600 p-3 rounded-2xl animate-pulse shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <span className="text-slate-500 font-medium tracking-tight">Loading OpsVault...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <Router>
      <Layout user={user} />
    </Router>
  );
}
