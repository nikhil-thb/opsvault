import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Briefcase, Activity, ChevronRight, Zap } from 'lucide-react';

export default function Dashboard({ user }: { user: any }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ incidents: 0, projects: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/problems/?limit=1').then(r => r.json()),
      fetch('/api/projects/').then(r => r.json())
    ]).then(([probData, projData]) => {
      setStats({
        incidents: probData.total || 0,
        projects: projData.length || 0
      });
    }).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setError('');
    try {
      const res = await fetch(`/api/search/?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Search Section - Calm Slate */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 shadow-xl sm:px-12 sm:py-24">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-teal-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-teal-400" /> Operational Intelligence
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl mb-6">
            Welcome, {user.username}
          </h2>
          <p className="text-lg leading-8 text-slate-400 mb-10 font-light">
            Search the knowledge base for previous incidents, root causes, and verified solutions.
          </p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto items-center justify-center gap-x-3">
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="query"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="block w-full rounded-2xl border border-slate-700/50 bg-slate-800/50 py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 shadow-inner focus:border-teal-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-teal-500/50 sm:text-lg sm:leading-6 outline-none transition-all backdrop-blur-md"
                placeholder="Search error logs or apps..."
              />
            </div>
            <button
              type="submit"
              className="flex-none rounded-2xl bg-teal-600/90 hover:bg-teal-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-900/20 transition-all hover:scale-105 active:scale-95 border border-teal-500/50"
            >
              Search
            </button>
          </form>
          {error && <p className="mt-6 text-sm font-medium text-red-200 bg-red-900/30 border border-red-800/50 inline-block px-4 py-1.5 rounded-full">{error}</p>}
        </div>
      </div>

      {/* Stats Cards - Soft UI */}
      {!results.length && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
          <div className="overflow-hidden rounded-2xl bg-white px-8 py-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md hover:border-teal-200">
            <div className="flex items-center gap-x-4 mb-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <Activity className="h-6 w-6 text-slate-600" />
              </div>
              <div className="text-sm font-medium text-slate-500">System Status</div>
            </div>
            <div className="flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-slate-800">Healthy</span>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-white px-8 py-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md hover:border-teal-200 group cursor-pointer" onClick={() => navigate('/problems')}>
            <div className="flex items-center gap-x-4 mb-4">
              <div className="rounded-xl bg-teal-50 p-3 border border-teal-100 group-hover:bg-teal-100/50 transition-colors">
                <AlertCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-sm font-medium text-slate-500">Total Incidents</div>
            </div>
            <div className="flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-slate-800">{stats.incidents}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white px-8 py-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md hover:border-teal-200 group cursor-pointer" onClick={() => navigate('/projects')}>
            <div className="flex items-center gap-x-4 mb-4">
              <div className="rounded-xl bg-sky-50 p-3 border border-sky-100 group-hover:bg-sky-100/50 transition-colors">
                <Briefcase className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-sm font-medium text-slate-500">Active Projects</div>
            </div>
            <div className="flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-slate-800">{stats.projects}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white shadow-sm border border-slate-200/60 sm:rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-800">Results ({results.length})</h3>
            <button onClick={() => setResults([])} className="text-sm text-slate-400 hover:text-teal-600 font-medium transition-colors">Clear</button>
          </div>
          <ul role="list" className="divide-y divide-slate-100">
            {results.map((problem) => (
              <li key={problem.id} className="relative group">
                <Link to={`/problems/${problem.id}`} className="block px-8 py-6 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="truncate text-lg font-medium text-slate-800 group-hover:text-teal-600 transition-colors">{problem.title}</p>
                    <div className="ml-2 flex flex-shrink-0 items-center gap-4">
                      <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${problem.status === 'OPEN' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {problem.status}
                      </p>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 shadow-sm">
                        {problem.category}
                      </span>
                      {problem.author_username && (
                        <span className="text-sm text-slate-500">By <span className="font-medium text-slate-700">{problem.author_username}</span></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Updated {new Date(problem.updated_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
