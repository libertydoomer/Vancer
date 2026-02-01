
import { FileText, Calendar, CheckCircle, ChevronRight, Search, AlertCircle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SavedReportPanelProps {
    report: any;
    onClose: () => void;
}

export function SavedReportPanel({ report, onClose }: SavedReportPanelProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8 relative">
            {/* Header / Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm pr-16">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate pr-4" title={report.fileName}>
                            {report.fileName}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(report.createdAt).toLocaleDateString()}
                            <span className="mx-2 text-slate-200">•</span>
                            <span className="text-blue-500">Stored Analysis</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absolute Close Button */}
            <button
                onClick={onClose}
                className="absolute -top-12 right-0 sm:top-0 sm:right-3 p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-50 focus:outline-none flex items-center gap-2 group"
                title="Close"
            >
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Close Report</span>
                <X className="w-5 h-5" />
            </button>

            {/* Roles & Search Terms - Unified Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 w-full">
                    {/* Best Fit Roles */}
                    <div className="p-6 sm:p-8 w-full min-w-0">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Best Fit Roles
                        </h3>
                        <div className="flex flex-wrap gap-2 w-full">
                            {report.jobTitles?.map((title: string, i: number) => (
                                <Link href={`/?q=${encodeURIComponent(title)}`} key={i} className="max-w-full min-w-0 shrink-1">
                                    <span className="px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-sm font-bold border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer flex items-center group/role whitespace-normal break-words h-auto min-h-[40px] w-full">
                                        <span className="flex-1 min-w-0 break-words">{title}</span>
                                        <ChevronRight className="w-3.5 h-3.5 ml-1.5 shrink-0 opacity-0 -translate-x-2 group-hover/role:opacity-40 group-hover/role:translate-x-0 transition-all" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Search Terms */}
                    <div className="p-6 sm:p-8 bg-slate-50/30 w-full min-w-0">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Search className="w-4 h-4 text-blue-500" />
                            Search Terms
                        </h3>
                        <div className="space-y-2">
                            {report.searchQueries?.map((q: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-sm font-semibold text-slate-700 hover:border-blue-200 transition-all group/item min-w-0">
                                    <span className="truncate mr-2 flex-1 min-w-0">{q}</span>
                                    <Link href={`/?q=${encodeURIComponent(q)}`} className="shrink-0">
                                        <Button size="sm" variant="ghost" className="h-8 px-3 text-blue-600 font-bold opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            Search
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Critique Section */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Ways to Improve
                </h3>
                <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                    {report.critique?.map((point: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-slate-600 leading-relaxed font-semibold group">
                            <div className="mr-3 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full group-hover:scale-150 transition-transform" />
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Career Legend / Narrative Section */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 rounded-[2rem] p-1 sm:p-1.5 border border-indigo-100 shadow-xl shadow-indigo-500/5">
                <div className="bg-white rounded-[1.8rem] border border-white/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Resume Narrative
                        </h3>
                        <div className="h-px flex-1 mx-8 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                    </div>
                    <div className="p-8 sm:p-16">
                        <div className="max-w-4xl mx-auto text-base sm:text-lg font-medium leading-relaxed text-slate-700 text-justify">
                            <span className="text-indigo-600/20 text-6xl absolute -mt-4 -ml-8 leading-none">“</span>
                            {report.legend || report.improvedResume || 'Analysis narrative not available.'}
                            <span className="text-indigo-600/20 text-6xl absolute -mt-4 leading-none ml-2">”</span>
                        </div>
                        <div className="mt-16 flex flex-col items-center gap-4">
                            <div className="w-12 h-0.5 bg-indigo-100 rounded-full" />
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                Summary for Introduction
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
