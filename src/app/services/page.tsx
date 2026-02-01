import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ResumeUpload } from '@/components/resume-upload';
import { Sparkles } from 'lucide-react';
import { Header } from '@/components/header';

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans">
            <Header user={user} activePage="services" showBackButton />

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
