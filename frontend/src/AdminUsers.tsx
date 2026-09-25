import React, { useState, useEffect } from 'react';

export default function AdminUsers({ currentUser }: { currentUser?: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');

  const fetchUsers = () => {
    fetch('/api/users/')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ORG_ADMIN' ? 'USER' : 'ORG_ADMIN';
    await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    fetchUsers();
  };

  const handleResetPin = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to reset the PIN for ${username}?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}/reset-pin`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully reset PIN for ${username}.\n\nTheir new temporary PIN is: ${data.new_pin}\n\nPlease share this with them securely.`);
      } else {
        alert("Failed to reset PIN.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove user ${username}?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, pin: newPin })
    });
    setNewUsername('');
    setNewPin('');
    fetchUsers();
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="bg-white shadow sm:rounded-lg p-6 mb-8 border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800">Add New User</h3>
        <form onSubmit={handleCreateUser} className="mt-4 flex gap-4">
          <input type="text" placeholder="Username" required value={newUsername} onChange={e=>setNewUsername(e.target.value)} className="rounded-lg border-slate-300 shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500" />
          <input type="password" placeholder="4-digit PIN" maxLength={4} required value={newPin} onChange={e=>setNewPin(e.target.value)} className="rounded-lg border-slate-300 shadow-sm sm:text-sm focus:ring-teal-500 focus:border-teal-500" />
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors">Add User</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-slate-200">
        <ul className="divide-y divide-slate-100">
          {users.map((u: any) => (
            <li key={u.id} className="px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-full sm:w-auto text-left">
                <p className="text-base font-semibold text-slate-900">{u.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${u.role === 'ORG_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                <button 
                  onClick={() => handleResetPin(u.id, u.username)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-teal-600 transition-colors"
                >
                  Reset PIN
                </button>
                {currentUser?.id !== u.id && (
                  <>
                    <button 
                      onClick={() => handleRoleChange(u.id, u.role)}
                      className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-teal-600 transition-colors"
                    >
                      {u.role === 'ORG_ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
