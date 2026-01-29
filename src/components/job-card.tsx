'use client';

import { Card } from '@/components/ui/card';
import { Job } from '@/lib/theirstack';
import { toggleFavorite } from '@/app/actions';
import { enrichJobDescription } from '@/lib/gemini-action';
import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, Calendar, Heart, MessageSquare, Sparkles, Database, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { toast } from 'sonner';
// Simulating cn if not present, but usually standard in shadcn. I'll include inline util if needed or rely on template literals.

export function JobCard({ job, initialIsFavorite = false }: { job: Job; initialIsFavorite?: boolean }) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await enrichJobDescription(job.description);
            setAnalysis(result);
        } catch (e) {
            setAnalysis("Analysis failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 mb-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 cursor-pointer">
                                <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                                <span className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
                                    {job.company}
                                    <svg className="w-3 h-3 text-blue-500 fill-blue-500" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {job.salary && job.salary !== 'Salary hidden' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {job.salary}
                            </span>
                        )}
                        {job.location && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                            </span>
                        )}
                        {job.tags?.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                {tag}
                            </span>
                        ))}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                        >
                            Apply Now
                        </a>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {loading ? 'Analyzing...' : 'Analyze with AI'}
                        </button>

                        <button
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-auto"
                            onClick={async () => {
                                setIsFavorite(!isFavorite);
                                try {
                                    const result = await toggleFavorite(job);
                                    if (result && result.error === "Unauthorized") {
                                        setIsFavorite(initialIsFavorite); // Revert
                                        toast.error("Please sign in to save jobs", {
                                            description: "Create an account to track your favorite opportunities.",
                                            style: {
                                                maxWidth: '350px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto'
                                            }
                                        });
                                    }
                                } catch (e) {
                                    setIsFavorite(initialIsFavorite); // Revert on error
                                    console.error("Favorite failed", e);
                                    toast.error("Failed to update favorite");
                                }
                            }}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                    </div>

                    {analysis && (
                        <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            {(() => {
                                try {
                                    // Attempt to parse JSON (handling potential markdown code blocks)
                                    const cleanJson = analysis.replace(/^```json\s*|\s*```$/g, '');
                                    const data = JSON.parse(cleanJson);

                                    // Check if it has the expected structure
                                    if (!data.verdict || !data.conclusion) throw new Error("Invalid format");

                                    const isPositive = data.verdict === 'Apply';
                                    const isCaution = data.verdict === 'Caution';

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                                    AI Assessment
                                                </h3>
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-sm font-bold border",
                                                    isPositive && "bg-green-50 text-green-700 border-green-200",
                                                    isCaution && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                                    !isPositive && !isCaution && "bg-red-50 text-red-700 border-red-200"
                                                )}>
                                                    {data.verdict.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 italic">
                                                "{data.conclusion}"
                                            </div>

                                            <div className="grid gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-1.5 bg-green-100 text-green-600 rounded-lg mt-0.5">
                                                        <DollarSign className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Salary</span>
                                                        <p className="text-sm font-medium text-slate-900">{data.salary}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg mt-0.5">
                                                        <Database className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tech Stack</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {data.techStack?.map((tech: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600 font-medium">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {data.redFlags && data.redFlags.length > 0 && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1.5 bg-red-100 text-red-600 rounded-lg mt-0.5">
                                                            <Shield className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potential Risks</span>
                                                            <ul className="mt-1 space-y-1">
                                                                {data.redFlags.map((flag: string, i: number) => (
                                                                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                                                                        <span className="block w-1 h-1 bg-red-400 rounded-full mt-2" />
                                                                        {flag}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    // Fallback for simple string or error messages
                                    return (
                                        <div className="p-4 bg-blue-50 rounded-xl text-sm text-slate-700 border border-blue-100">
                                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                                AI Analysis Result
                                            </h3>
                                            <div className="whitespace-pre-line leading-relaxed">
                                                {analysis}
                                            </div>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
