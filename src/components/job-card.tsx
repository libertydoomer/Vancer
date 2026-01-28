'use client';

import { Card } from '@/components/ui/card';
import { Job } from '@/lib/theirstack';
import { toggleFavorite } from '@/app/actions';
import { enrichJobDescription } from '@/lib/gemini-action';
import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, Calendar, Heart, MessageSquare } from 'lucide-react';
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
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-slate-700 border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                AI Analysis Result
                            </h3>
                            <div className="whitespace-pre-line leading-relaxed">
                                {analysis}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
