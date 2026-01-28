
import { getFavoriteJobs } from '@/app/actions';
import { JobCard } from '@/components/job-card';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function FavoritesPage() {
    const jobs = await getFavoriteJobs();

    return (
        <main className="min-h-screen bg-slate-50 font-sans pb-20">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 transition-colors mr-2 text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">J</div>
                        <h1 className="text-lg font-bold text-slate-900">JobFavorites</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Your Saved Jobs
                    </h2>
                    <p className="text-slate-500 max-w-lg mx-auto">
                        Review and manage your favorite opportunities.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {jobs.length} Saved Items
                        </h3>
                    </div>

                    <div className="grid gap-4">
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    initialIsFavorite={true}
                                />
                            ))
                        ) : (
                            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                                <p className="text-slate-500 mb-4">You haven't saved any jobs yet.</p>
                                <Link href="/" className="text-blue-600 font-medium hover:underline">
                                    Find jobs to save
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
