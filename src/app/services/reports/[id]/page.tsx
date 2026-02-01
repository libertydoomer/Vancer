
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { getAnalysisById } from '@/app/services/actions';
import { CheckCircle, Search, AlertCircle, Sparkles, ChevronRight, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    let report;
    try {
        report = await getAnalysisById(id);
    } catch (e) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Report Not Found</h1>
                <Link href="/services">
                    <Button>Back to Services</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans pb-20">
            <Header user={user} activePage="services" showBackButton />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 truncate max-w-[300px]" title={report.fileName}>
                                {report.fileName}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(report.createdAt!).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-blue-600 font-medium italic">Saved Report</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Insights */}
                    <div className="space-y-6">
                        {/* Job Matches */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                                Best Fit Roles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {report.jobTitles?.map((title, i) => (
                                    <Link href={`/?q=${encodeURIComponent(title)}`} key={i} target="_blank">
                                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer flex items-center">
                                            {title}
                                            <ChevronRight className="w-3 h-3 ml-1 opacity-50" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Search Queries */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <Search className="w-5 h-5 mr-2 text-blue-500" />
                                Recommended Search Terms
                            </h3>
                            <div className="space-y-2">
                                {report.searchQueries?.map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
                                        {q}
                                        <Link href={`/?q=${encodeURIComponent(q)}`} target="_blank">
                                            <Button size="sm" variant="ghost" className="h-7 text-blue-600 hover:text-blue-700">
                                                Apply
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Critique */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                                Ways to Improve
                            </h3>
                            <ul className="space-y-3">
                                {report.critique?.map((point, i) => (
                                    <li key={i} className="flex items-start text-sm text-slate-600">
                                        <span className="mr-2 mt-1 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Legend */}
                    <div className="flex flex-col h-full">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 h-full min-h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                                    Your Career Legend
                                </h3>
                            </div>
                            <div className="flex-1 p-0 relative">
                                <textarea
                                    className="w-full h-full p-6 resize-none focus:outline-none text-sm leading-relaxed font-mono text-slate-700 bg-white"
                                    value={report.legend || ''}
                                    readOnly
                                />
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Note: Memorize this narrative to answer "Tell me about yourself" with confidence.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
