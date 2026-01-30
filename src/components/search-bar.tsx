'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, RotateCcw, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export function SearchBar({ initialQuery }: { initialQuery: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [placeholder, setPlaceholder] = useState('');

    const [query, setQuery] = useState(initialQuery);
    const [isOpen, setIsOpen] = useState(false);
    const [days, setDays] = useState<string>(searchParams.get('days') || '30');
    const [minSalary, setMinSalary] = useState<number>(Number(searchParams.get('minSalary')) || 0);
    const [stack, setStack] = useState<string[]>(searchParams.get('stack')?.split(',').filter(Boolean) || []);
    const [stackInput, setStackInput] = useState('');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setPlaceholder('');
            } else {
                setPlaceholder('Which vacancies are you interested in monitoring?');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ... existing sync state ...
    useEffect(() => {
        setDays(searchParams.get('days') || '30');
        // ... (rest of existing effect)
        setMinSalary(Number(searchParams.get('minSalary')) || 0);
        setStack(searchParams.get('stack')?.split(',').filter(Boolean) || []);
        // Also sync query if needed, although initialQuery usually handles the first load
        // But if URL changes externally, good to sync:
        const q = searchParams.get('q');
        if (q !== null) setQuery(q);
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Search Query
        if (query) params.set('q', query);
        else params.delete('q');

        // Filter Params
        if (days) params.set('days', days);
        else params.delete('days');

        if (minSalary > 0) params.set('minSalary', minSalary.toString());
        else params.delete('minSalary');

        if (stack.length > 0) params.set('stack', stack.join(','));
        else params.delete('stack');

        router.push(`/?${params.toString()}`);
        setIsOpen(false);
    };

    const handleReset = () => {
        setDays('30');
        setMinSalary(0);
        setStack([]);
        setStackInput('');
        setQuery('');
        router.push('/');
    };

    const addStack = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && stackInput.trim()) {
            e.preventDefault();
            if (!stack.includes(stackInput.trim())) {
                setStack([...stack, stackInput.trim()]);
            }
            setStackInput('');
        }
    };

    const removeStack = (tag: string) => {
        setStack(stack.filter(s => s !== tag));
    };

    const hasActiveFilters = minSalary > 0 || stack.length > 0 || days !== '30';

    return (
        <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
                <a
                    href="/favorites"
                    className="flex-shrink-0 w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                    title="View Favorites"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-6 h-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </a>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex-shrink-0 w-14 h-14 bg-white border rounded-2xl flex items-center justify-center transition-all shadow-sm relative ${isOpen || hasActiveFilters
                        ? 'text-blue-600 border-blue-200 bg-blue-50'
                        : 'text-slate-400 border-slate-200 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                    title="Filters"
                >
                    <Filter className="w-6 h-6" />
                    {hasActiveFilters && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                </button>

                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 h-14"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 w-12 sm:w-20 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Filter Panel */}
            {isOpen && (
                <div className="mt-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-6">

                        {/* Posting Time */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-900">Posting Time</Label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Last 24 hours', value: '1' },
                                    { label: 'Last 3 days', value: '3' },
                                    { label: 'Last 7 days', value: '7' },
                                    { label: 'Last 30 days', value: '30' },
                                    { label: 'All time', value: '90' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setDays(option.value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${days === option.value
                                            ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-sm font-semibold text-slate-900">Minimum Salary (Annual)</Label>
                                <span className="text-sm text-slate-500 font-medium">
                                    {minSalary === 0 ? 'Any' : `$${minSalary.toLocaleString()}+`}
                                </span>
                            </div>
                            <Slider
                                defaultValue={[minSalary]}
                                max={200000}
                                step={10000}
                                onValueChange={(val) => setMinSalary(val[0])}
                                className="py-4"
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-900">Tech Stack / Keywords</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Type and press Enter (e.g. React, Python)..."
                                    value={stackInput}
                                    onChange={(e) => setStackInput(e.target.value)}
                                    onKeyDown={addStack}
                                    className="pr-10"
                                />
                            </div>
                            {stack.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {stack.map(s => (
                                        <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {s}
                                            <button type="button" onClick={() => removeStack(s)} className="ml-2 hover:text-indigo-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button variant="ghost" type="button" onClick={handleReset} className="text-slate-500 hover:text-slate-700">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="button" onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">Apply Filters</Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
