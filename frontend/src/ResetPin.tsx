import React, { useState } from 'react';

export default function ResetPin() {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        try {
            const res = await fetch('/api/auth/reset-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_pin: currentPin, new_pin: newPin })
            });
            if (res.ok) {
                setMessage('PIN reset successfully!');
                setCurrentPin('');
                setNewPin('');
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to reset PIN');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 max-w-md mt-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Reset PIN</h3>
            {message && <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded">{message}</div>}
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <form onSubmit={handleReset} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current PIN</label>
                    <input 
                        type="password" maxLength={4} required 
                        value={currentPin} onChange={e => setCurrentPin(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6 px-3" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New PIN</label>
                    <input 
                        type="password" maxLength={4} required 
                        value={newPin} onChange={e => setNewPin(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6 px-3" 
                    />
                </div>
                <button type="submit" className="bg-teal-600 text-white px-3 py-2 rounded text-sm hover:bg-teal-500">
                    Change PIN
                </button>
            </form>
        </div>
    );
}
