import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Key, User } from 'lucide-react';

export default function ProfileDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowReset(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/auth/reset-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_pin: currentPin, new_pin: newPin })
    });
    if (res.ok) {
      setMsg('PIN updated successfully!');
      setCurrentPin('');
      setNewPin('');
      setTimeout(() => setShowReset(false), 2000);
    } else {
      const data = await res.json();
      setMsg(data.detail || 'Failed');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100"
      >
        <User className="w-4 h-4" />
        {user.username}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          
          {!showReset ? (
            <>
              <button 
                onClick={() => setShowReset(true)}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Key className="w-4 h-4 mr-2" /> Change PIN
              </button>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm font-medium mb-3">Change PIN</p>
              {msg && <p className="text-xs text-teal-600 mb-2">{msg}</p>}
              <form onSubmit={handleReset} className="space-y-3">
                <input type="password" required maxLength={4} placeholder="Current PIN" value={currentPin} onChange={e=>setCurrentPin(e.target.value)} className="block w-full rounded border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 text-sm" />
                <input type="password" required maxLength={4} placeholder="New PIN" value={newPin} onChange={e=>setNewPin(e.target.value)} className="block w-full rounded border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 text-sm" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-teal-600 text-white px-2 py-1 rounded text-xs">Save</button>
                  <button type="button" onClick={() => setShowReset(false)} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
