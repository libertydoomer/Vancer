import { getNicheJobs, Job } from '@/lib/theirstack';
import { getAdzunaJobs } from '@/lib/adzuna';
import { JobCard } from '@/components/job-card';
import { SearchBar } from '@/components/search-bar';
import { Suspense } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from '@/lib/user-sync';
import { getFavoriteJobIds } from '@/app/actions';
import { Briefcase, Sparkles, Zap, Globe, Shield } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Sync the user to the database if they are logged in
  await syncUser();
  const user = await currentUser();

  // --------------------------------------------------------------------------
  // LANDING PAGE (Unauthenticated State)
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">V</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">VANCER</span>
            </div>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in-up">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Gemini AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Your Next Role <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                With AI Precision
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Vancer aggregates job listings from top sources and uses advanced AI to analyze tech stacks, requirements, and opportunities just for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl shadow-slate-900/20 w-full sm:w-auto flex items-center justify-center gap-2">
                  Get Started <Zap className="w-5 h-5 text-yellow-400" />
                </button>
              </SignInButton>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24 w-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Aggregation</h3>
              <p className="text-slate-500 leading-relaxed">
                We scan thousands of job boards including Adzuna and TheirStack to bring you the niche opportunities others miss.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Analysis</h3>
              <p className="text-slate-500 leading-relaxed">
                Our Gemini-powered engine analyzes job descriptions to extract key tech stacks and hidden requirements.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
              <p className="text-slate-500 leading-relaxed">
                Your data and search preferences are securely stored. Login to save favorites and track your applications.
              </p>
            </div>
          </div>
        </div>

        <footer className="w-full py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white">
          &copy; {new Date().getFullYear()} Vancer. Powered by 2caps team.
        </footer>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED APP VIEW
  // --------------------------------------------------------------------------
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
            Hello, <span className="font-medium text-slate-900">{user.firstName}</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
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
