'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AuthForm } from './auth-form';
import { X } from 'lucide-react';

export function AuthModal({ children, defaultMode = 'signin' }: { children: React.ReactNode; defaultMode?: 'signin' | 'signup' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
                {children}
            </div>
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto w-screen h-screen">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Scroll Container wrapper for safe centering */}
                    <div className="min-h-full w-full flex items-center justify-center p-4 relative z-10 pointer-events-none">
                        <div
                            className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button inside the card */}
                            <div className="absolute right-4 top-4 z-10">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Render Form directly, AuthForm handles its own layout */}
                            <AuthForm key={defaultMode} initialMode={defaultMode} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
