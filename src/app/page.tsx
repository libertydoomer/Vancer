import { getNicheJobs, Job } from '@/lib/theirstack';
import { getAdzunaJobs } from '@/lib/adzuna';
import { JobCard } from '@/components/job-card';
import { SearchBar } from '@/components/search-bar';
import { Suspense } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from '@/lib/user-sync';

import { getFavoriteJobIds } from '@/app/actions';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Sync the user to the database if they are logged in
  await syncUser();
  const user = await currentUser();

  const query = (await searchParams).q || 'Remote AI Architect';

  const [theirStackData, adzunaJobs] = await Promise.all([
    getNicheJobs(query),
    getAdzunaJobs(query)
  ]);

  const jobs = [...(theirStackData.jobs || []), ...adzunaJobs];
  const favoriteJobIds = await getFavoriteJobIds();

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-lg font-bold text-slate-900">VANCER</h1>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block text-sm text-slate-500">
            Hello, <span className="font-medium text-slate-900">{user?.firstName || 'Guest'}</span>
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

      <div className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            VANCER
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Enter the vacancies you are interested in. We'll find them and analyze the technology stack for you.
          </p>
        </div>

        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-slate-200 rounded-2xl mb-8" />}>
          <SearchBar initialQuery={query} />
        </Suspense>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Suggestions:</span>
          {[
            'AI Architect',
            'Generative AI Engineer',
            'Prompt Engineer',
            'Remote ML Ops',
            'AI Product Manager'
          ].map((s) => (
            <a
              key={s}
              href={`/?q=${encodeURIComponent(s)}`}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {jobs.length} Openings Found
              {jobs.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                Last 30 Days
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {jobs.length > 0 ? (
              jobs.map((job: Job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  initialIsFavorite={favoriteJobIds.includes(String(job.id))}
                />
              ))
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                <p className="text-slate-500">No jobs found for "{query}". Try another search!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full py-6 text-center text-slate-400 text-sm">
        Powered by 2caps team
      </footer>
    </main>
  );
}
