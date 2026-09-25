import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Plus, Check } from 'lucide-react';

function ProjectItem({ project, user, allUsers }: { project: any, user: any, allUsers: any[] }) {
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (user.role === 'ORG_ADMIN' && showUsers) {
      fetch(`/api/projects/${project.id}/users`).then(r => r.json()).then(setProjectUsers);
    }
  }, [project.id, user.role, showUsers]);

  const toggleUser = async (uId: string, isAssigned: boolean) => {
    const method = isAssigned ? 'DELETE' : 'POST';
    await fetch(`/api/projects/${project.id}/users/${uId}`, { method });
    fetch(`/api/projects/${project.id}/users`).then(r => r.json()).then(setProjectUsers);
  };

  return (
    <li className="bg-white shadow-sm border border-slate-200/60 rounded-3xl p-8 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100">
            <Briefcase className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-900">{project.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-500/20'}`}>
                {project.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
        {user.role === 'ORG_ADMIN' && (
          <button 
            onClick={() => setShowUsers(!showUsers)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${showUsers ? 'bg-slate-100 text-slate-700' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/50'}`}
          >
            <Users className="w-4 h-4" />
            {showUsers ? 'Hide Team' : 'Manage Team'}
          </button>
        )}
      </div>

      {showUsers && user.role === 'ORG_ADMIN' && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" /> Assigned Members
          </h4>
          <div className="flex flex-wrap gap-2">
            {allUsers.map(u => {
              const isAssigned = projectUsers.some(pu => pu.id === u.id);
              return (
                <button 
                  key={u.id}
                  onClick={() => toggleUser(u.id, isAssigned)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${isAssigned ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
                >
                  {u.username}
                  {isAssigned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );
}

export default function Projects({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects/').then(r => r.json()).then(setProjects).catch(console.error);
    if (user.role === 'ORG_ADMIN') {
      fetch('/api/users/').then(r => r.json()).then(setAllUsers).catch(console.error);
    }
  }, [user.role]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch('/api/projects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      setProjects([await res.json(), ...projects]);
      setName('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white px-8 py-8 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-2 font-light">Manage isolated environments and teams.</p>
        </div>
      </div>

      {user.role === 'ORG_ADMIN' && (
        <div className="bg-white px-8 py-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <h3 className="text-sm font-medium text-slate-700 mb-1">Create a new Project</h3>
            <form onSubmit={createProject} className="flex gap-3">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="E.g., Production Infrastructure" 
                className="flex-1 border-0 ring-1 ring-inset ring-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:ring-2 focus:ring-teal-600 outline-none bg-slate-50" 
                required 
              />
              <button 
                type="submit" 
                className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-500 shadow-sm transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" /> Create
              </button>
            </form>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {projects.length === 0 && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No Projects</h3>
            <p className="text-slate-500 mt-2 font-light">
              {user.role === 'ORG_ADMIN' ? 'Create a project above to get started.' : 'Ask your admin to assign you to a project.'}
            </p>
          </div>
        )}
        {projects.map((p: any) => (
          <ProjectItem key={p.id} project={p} user={user} allUsers={allUsers} />
        ))}
      </ul>
    </div>
  );
}
