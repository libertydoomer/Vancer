'use client';

import { createClient } from '@/utils/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthForm({ initialMode = 'signin' }: { initialMode?: 'signin' | 'signup' }) {
    const supabase = createClient();
    const router = useRouter(); // Use App Router
    const view = initialMode === 'signup' ? 'sign_up' : 'sign_in';
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                router.refresh(); // Refresh server components to update UI based on new session
                // Optional: For modal behavior, you might rely on the parent checking user state, 
                // but refreshing is the safest way to ensure the app "knows" we are logged in.
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    if (!origin) return null;

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-900 text-center">
                {initialMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <Auth
                supabaseClient={supabase}
                view={view}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: '#2563eb', // blue-600
                                brandAccent: '#1d4ed8', // blue-700
                                inputBorder: '#e2e8f0', // slate-200
                                inputBackground: '#ffffff',
                                inputText: '#0f172a', // slate-900
                                inputLabelText: '#64748b', // slate-500
                                defaultButtonBackground: '#ffffff',
                                defaultButtonBackgroundHover: '#f8fafc', // slate-50
                                defaultButtonBorder: '#e2e8f0', // slate-200
                                defaultButtonText: '#0f172a', // slate-900
                            },
                            radii: {
                                borderRadiusButton: '0.75rem', // rounded-xl
                                inputBorderRadius: '0.75rem', // rounded-xl
                            },
                            space: {
                                inputPadding: '1rem', // p-4
                                buttonPadding: '0.75rem 1rem',
                            },
                            fonts: {
                                bodyFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                buttonFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                            }
                        }
                    },
                    className: {
                        button: 'shadow-sm font-semibold',
                        input: 'font-sans',
                        label: 'font-medium',
                    }
                }}
                theme="light"
                showLinks={true}
                providers={[]} // Temporarily hidden
                redirectTo={`${origin}/auth/callback`}
            />
        </div>
    );
}
