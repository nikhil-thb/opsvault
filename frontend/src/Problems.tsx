import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, PlusCircle } from 'lucide-react';

export default function Problems({ user }: { user: any }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/problems/')
      .then(r => r.json())
      .then(data => {
        setProblems(data.items || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-slate-400 font-medium animate-pulse flex items-center gap-2">
        <FileText className="w-5 h-5" /> Loading incidents...
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white px-8 py-8 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Incident Directory</h1>
          <p className="text-sm text-slate-500 mt-2 font-light">Manage and review post-mortems and fixes.</p>
        </div>
        <Link 
          to="/problems/new" 
          className="group inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-teal-500 shadow-lg shadow-teal-900/10 transition-all hover:scale-105 active:scale-95 border border-teal-500/50"
        >
          <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Record Incident
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden sm:rounded-3xl">
        <ul className="divide-y divide-slate-100">
          {problems.length === 0 && (
            <li className="p-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No incidents recorded yet</h3>
              <p className="text-slate-500 mt-2 font-light">Get started by creating your first post-mortem.</p>
            </li>
          )}
          {problems.map((p: any) => (
            <li key={p.id} className="relative group">
              <Link to={`/problems/${p.id}`} className="block hover:bg-slate-50/80 transition-colors">
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="truncate text-lg font-medium text-slate-900 group-hover:text-teal-600 transition-colors">{p.title}</p>
                    <div className="ml-2 flex flex-shrink-0 items-center gap-4">
                      <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${p.status === 'OPEN' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {p.status}
                      </p>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="flex sm:justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 shadow-sm">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                        <img src={`https://ui-avatars.com/api/?name=${p.author_username || 'U'}&background=ccfbf1&color=0f766e&rounded=true&size=20`} alt="" className="w-5 h-5 rounded-full" />
                        {p.author_username || "Unknown"}
                      </div>
                      {p.technology && (
                        <span className="text-sm text-slate-400 font-light">• Tech: {p.technology}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(p.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
