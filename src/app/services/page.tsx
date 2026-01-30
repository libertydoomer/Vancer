import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ResumeUpload } from '@/components/resume-upload';
import { Sparkles, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans">
            <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between relative">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
                        <h1 className="text-lg font-bold text-slate-900">VANCER</h1>
                    </Link>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block text-sm text-slate-500">
                        Hello, <span className="font-medium text-slate-900">{user.email?.split('@')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            Services
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <div className="md:hidden">
                                <Button variant="ghost" size="icon" className="text-blue-600 bg-blue-50" title="Services">
                                    <Sparkles className="w-5 h-5" />
                                </Button>
                            </div>
                            <Link href="/settings">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600" title="Settings">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                            <form action="/auth/signout" method="post">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500" title="Sign Out">
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-12">

                <div className="text-center mb-12">
                    <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">AI-Powered Tools</span>
                    <h1 className="text-4xl font-extrabold text-slate-900 mt-2">Services</h1>
                    <p className="text-slate-500 mt-4 max-w-lg mx-auto">
                        Enhance your job search with our suite of AI analysis tools designed to give you a competitive edge.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Resume Analysis Service */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                Resume Analysis
                            </h3>
                            <p className="text-slate-500 mt-2 ml-13 pl-13">
                                Upload your resume to get AI-driven insights on how well it matches your target job market.
                                We identify missing keywords, suggest improvements, and rate your resume against top job descriptions.
                            </p>
                        </div>
                        <div className="p-8">
                            <ResumeUpload />
                        </div>
                    </div>

                    {/* Placeholder for Future Services */}
                    <div className="grid md:grid-cols-2 gap-6 opacity-60">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center text-center justify-center h-full min-h-[200px]">
                            <span className="bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1 rounded-full mb-4">COMING SOON</span>
                            <h3 className="text-lg font-bold text-slate-800">Cover Letter Generator</h3>
                            <p className="text-slate-400 text-sm mt-2">Create tailored cover letters in seconds.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center text-center justify-center h-full min-h-[200px]">
                            <span className="bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1 rounded-full mb-4">COMING SOON</span>
                            <h3 className="text-lg font-bold text-slate-800">Interview Coach</h3>
                            <p className="text-slate-400 text-sm mt-2">Practice with AI-simulated interviews.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
