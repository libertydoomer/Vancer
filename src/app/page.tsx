import { getNicheJobs, Job } from '@/lib/theirstack';
import { getAdzunaJobs } from '@/lib/adzuna';
import { JobCard } from '@/components/job-card';
import { SearchBar } from '@/components/search-bar';
import { Suspense } from 'react';
import { getFavoriteJobIds } from '@/app/actions';
import { Briefcase, Sparkles, Zap, Globe, Shield, LogOut, Settings } from 'lucide-react';
import { CompanyLogos } from '@/components/company-logos';
import { createClient } from '@/utils/supabase/server';
import { AuthModal } from '@/components/auth-modal'; // Import AuthModal
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ResumeUpload } from '@/components/resume-upload';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; days?: string; minSalary?: string; stack?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // --------------------------------------------------------------------------
  // LANDING PAGE (Unauthenticated State)
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden w-full">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">V</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">VANCER</span>
            </div>
            <div className="flex items-center gap-4">
              <AuthModal>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95">
                  Sign In
                </button>
              </AuthModal>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-12 md:py-20 bg-gradient-to-b from-slate-50 to-white w-full overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-8">


            <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Your Next Role <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                With AI Precision
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Vancer aggregates job listings from top sources and uses advanced AI to analyze tech stacks, requirements, and opportunities just for you.
            </p>

            <div className="w-full pt-8 pb-4 max-w-[90vw] md:max-w-full mx-auto overflow-hidden">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Evaluating vacancies from</p>
              <CompanyLogos />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <AuthModal defaultMode="signup">
                <button className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl shadow-slate-900/20 w-full sm:w-auto flex items-center justify-center gap-2">
                  Get Started <Zap className="w-5 h-5 text-yellow-400" />
                </button>
              </AuthModal>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12 md:mt-24 w-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Aggregation</h3>
              <p className="text-slate-500 leading-relaxed">
                We scan thousands of job boards including Adzuna and TheirStack to bring you the niche opportunities others miss.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Analysis</h3>
              <p className="text-slate-500 leading-relaxed">
                Our Gemini-powered engine analyzes job descriptions to extract key tech stacks and hidden requirements.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
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
          <div className="mb-2">
            <a
              href="https://t.me/libertydoomer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Want to build a similar project? Contact the 2Caps team
            </a>
          </div>
          &copy; {new Date().getFullYear()} Vancer. Powered by 2Caps Team.
        </footer>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED APP VIEW
  // --------------------------------------------------------------------------
  const query = (await searchParams).q || '';
  const daysParam = (await searchParams).days;
  const days = daysParam ? parseInt(daysParam) : 30; // Default 30 days if not specified
  const minSalaryParam = (await searchParams).minSalary;
  const minSalary = minSalaryParam ? parseInt(minSalaryParam) : 0;
  const stackParam = (await searchParams).stack;
  const stackFilter = stackParam ? stackParam.split(',') : [];

  const theirStackData = await getNicheJobs(query, { days });
  const adzunaJobs = await getAdzunaJobs(query, { days });

  let jobs = [...(theirStackData.jobs || []), ...adzunaJobs];

  // Client-side filtering (run on server before render)
  if (minSalary > 0 || stackFilter.length > 0) {
    jobs = jobs.filter(job => {
      // Salary Filter
      if (minSalary > 0) {
        if (!job.salary || job.salary === 'Salary hidden') return false;
        // Parse salary string: "$140k - $180k" or "$140,000"
        const numbers = job.salary.match(/\d+([.,]\d+)?/g);
        if (!numbers) return false;

        // Handle "k" suffix logic if needed, but usually normalized.
        // Assuming simple extraction for now.
        // If "150k", multiply by 1000.
        const rawString = job.salary.toLowerCase();
        let salaryValue = 0;

        // Simple heuristic: find the first number. If followed by 'k', multiply.
        const firstMatch = rawString.match(/(\d+)(?:,(\d+))?(k)?/);
        if (firstMatch) {
          let val = parseInt(firstMatch[1] + (firstMatch[2] || ''));
          if (firstMatch[3] === 'k') val *= 1000;
          salaryValue = val;
        }

        if (salaryValue < minSalary) return false;
      }

      // Stack Filter
      if (stackFilter.length > 0) {
        const content = (job.description + ' ' + (job.tags?.join(' ') || '') + ' ' + job.title).toLowerCase();
        const matchesRequest = stackFilter.every(s => content.includes(s.toLowerCase()));
        if (!matchesRequest) return false;
      }

      return true;
    });
  }

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
            Hello, <span className="font-medium text-slate-900">{user.email?.split('@')[0]}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/services" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              <Sparkles className="w-4 h-4" />
              Services
            </Link>
            <div className="flex items-center gap-1 md:gap-2">
              <Link href="/services" className="md:hidden">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600" title="Services">
                  <Sparkles className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600" title="Settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            VANCER
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Enter the vacancies you are interested in. We'll find them and analyze the technology stack for you.
          </p>
        </div>

        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-slate-200 rounded-2xl mb-8" />}>
          <SearchBar initialQuery={query} />
        </Suspense>



        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 mt-6">
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
              {/* Display active logic or status if needed */}
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
                <p className="text-slate-500">No jobs found for "{query}" with current filters. Try adjusting them!</p>
              </div>
            )}
          </div>
        </div>
      </div>



      <footer className="w-full py-6 text-center text-slate-400 text-sm">
        <div className="mb-2">
          <a
            href="https://t.me/libertydoomer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
          >
            Want to build a similar project? Contact the 2Caps Team
          </a>
        </div>
        Powered by 2Caps Team
      </footer>
    </main>
  );
}
