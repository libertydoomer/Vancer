'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Info, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoCredentialsPanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);
    const [attention, setAttention] = useState(false);

    // Trigger an attention animation periodically if closed
    useEffect(() => {
        if (isOpen) return;

        const interval = setInterval(() => {
            setAttention(prev => !prev);
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen]);

    const copyToClipboard = (text: string, type: 'email' | 'password') => {
        navigator.clipboard.writeText(text);
        if (type === 'email') {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        } else {
            setCopiedPass(true);
            setTimeout(() => setCopiedPass(false), 2000);
        }
    };

    return (
        <div
            className={`fixed left-0 top-24 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Toggle Button positioned on the right of the panel */}
            <div className="absolute right-0 top-8 translate-x-full">
                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-r-lg rounded-l-none border-l-0 h-10 w-10 bg-white border-slate-200 shadow-md flex relative overflow-visible ${!isOpen && 'animate-pulse ring-2 ring-blue-400 ring-offset-2'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}

                    {/* Attention indicator dot */}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    )}
                </Button>
            </div>

            <div className="w-96 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-r-xl p-6 h-auto max-h-[85vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-6 text-blue-600 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Sparkles className="w-5 h-5 fill-blue-600 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Welcome to Vancer</h3>
                        <p className="text-xs text-slate-500 font-medium">Premium Job Intelligence Platform</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Credentials Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Demo Credentials</h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-inner">
                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-slate-500 font-semibold uppercase">Email</label>
                                    {copiedEmail && <span className="text-[10px] text-green-600 font-bold animate-in fade-in slide-in-from-right-2">Copied!</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-slate-800 font-mono text-sm shadow-sm">test@test.com</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard('test@test.com', 'email')}
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        title="Copy Email"
                                    >
                                        {copiedEmail ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-slate-500 font-semibold uppercase">Password</label>
                                    {copiedPass && <span className="text-[10px] text-green-600 font-bold animate-in fade-in slide-in-from-right-2">Copied!</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-slate-800 font-mono text-sm shadow-sm">testtest</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard('testtest', 'password')}
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        title="Copy Password"
                                    >
                                        {copiedPass ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-400">
                            Click the clipboard icons to copy instantly.
                        </p>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-t border-slate-100 pt-4">Key Capabilities</h4>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-indigo-600 text-xs font-bold">01</span>
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800">Smart Aggregation & Search</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                        We don't just scrape; we curate. Vancer pulls authentic listings from niche platforms like <strong>TheirStack</strong> and <strong>Adzuna</strong>, giving you access to opportunities often missed by major boards.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-rose-600 text-xs font-bold">02</span>
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800">AI-Powered Analysis</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                        Powered by <strong>Gemini 1.5 Flash</strong>, our engine reads between the lines. It extracts specific tech stacks, identifies implicit requirements, and helps you tailor your application.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-emerald-600 text-xs font-bold">03</span>
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800">Transparent Insights</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                        Filter by <strong>real salary data</strong> and specific technologies. We normalize salary information to help you make informed career decisions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs leading-relaxed mt-4">
                            <p>
                                <span className="text-white font-bold">Pro Tip:</span> Login to unlock the "Favorites" feature and start tracking the jobs that matter to you.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
