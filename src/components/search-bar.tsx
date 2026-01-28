'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchBar({ initialQuery }: { initialQuery: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8 flex gap-2">
            <a
                href="/favorites"
                className="flex-shrink-0 w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                title="View Favorites"
            >
                <Search className="hidden" /> {/* Hack to keep import for now if needed, but switching to Heart for display */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-6 h-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </a>

            <div className="relative flex-1">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Which vacancies are you interested in monitoring?"
                    className="w-full px-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 h-14"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    Monitor
                </button>
            </div>
        </form>
    );
}
