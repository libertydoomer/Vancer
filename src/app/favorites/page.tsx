
import { getFavoriteJobs } from '@/app/actions';
import { JobCard } from '@/components/job-card';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';

export default async function FavoritesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const jobs = await getFavoriteJobs();

    return (
        <main className="min-h-screen bg-slate-50 font-sans pb-20">
            <Header user={user} activePage="favorites" showBackButton />

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
