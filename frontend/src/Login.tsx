import React, { useState } from 'react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [orgName, setOrgName] = useState('');
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
            const body = mode === 'signup' 
                ? JSON.stringify({ organization_name: orgName, username, pin })
                : JSON.stringify({ username, pin });

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body
            });
            if (res.ok) {
                onLogin();
            } else {
                const data = await res.json();
                setError(data.detail || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {mode === 'signup' ? 'Register Organization' : 'Login to OpsVault'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {mode === 'signup' 
                          ? 'Create a new organization and admin account' 
                          : 'Enter your credentials to access the knowledge base'}
                    </p>
                </div>

                <div className="flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className={`w-1/2 rounded-l-md px-4 py-2 text-sm font-medium border ${
                            mode === 'signin' 
                            ? 'bg-teal-600 text-white border-teal-600' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className={`w-1/2 rounded-r-md px-4 py-2 text-sm font-medium border-t border-b border-r ${
                            mode === 'signup' 
                            ? 'bg-teal-600 text-white border-teal-600' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        {mode === 'signup' && (
                            <div>
                                <label className="sr-only">Organization Name</label>
                                <input
                                    type="text"
                                    required
                                    className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="Organization Name"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label className="sr-only">Username</label>
                            <input
                                type="text"
                                required
                                className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="sr-only">4-digit PIN</label>
                            <input
                                type="password"
                                required
                                maxLength={4}
                                className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="4-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
                        >
                            {mode === 'signup' ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
