'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
// Note: signIn from next-auth/react is needed for client side. 
// But I haven't installed next-auth/react? 
// NextAuth v5 unifies it, but usually 'next-auth/react' is still used for client.
// Or we can import from 'next-auth/react' if using the 'next-auth' package.
// Wait, I installed 'next-auth'.
// In v5, we might need to use server actions or just 'next-auth/react'.
// Let's assume 'next-auth/react' is available. 
// Actually, for Credentials provider, a simple form or client component calling signIn is standard.

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // We use the NextAuth.js signIn method
            // It sends a request to /api/auth/callback/credentials
            const result = await signIn('credentials', {
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Incorrect password');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
            <div className="w-full max-w-md bg-dark-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                        Video Ref
                    </h1>
                    <p className="text-dark-text-muted">Enter password to access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-dark-surface-light border border-white/10 rounded-xl text-white placeholder-dark-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Checking...' : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
