import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    try {
        console.log('🔒 Enabling Row Level Security (RLS)...');

        // 1. Enable RLS on tables
        await sql`alter table public.profiles enable row level security`;
        await sql`alter table public.favorite_jobs enable row level security`;
        await sql`alter table public.resume_analyses enable row level security`;

        console.log('✅ RLS Enabled on profiles, favorite_jobs, and resume_analyses.');

        // 2. Policies for PROFILES
        await sql`drop policy if exists "Public profiles are viewable by everyone" on public.profiles`;
        await sql`create policy "Public profiles are viewable by everyone" on public.profiles for select using (true)`;

        await sql`drop policy if exists "Users can update own profile" on public.profiles`;
        await sql`create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id)`;

        console.log('✅ Policies set for profiles.');

        // 3. Policies for FAVORITE_JOBS
        await sql`drop policy if exists "Users can view own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can view own favorites" on public.favorite_jobs for select using (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can insert own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can insert own favorites" on public.favorite_jobs for insert with check (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can delete own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can delete own favorites" on public.favorite_jobs for delete using (auth.uid() = user_id)`;

        console.log('✅ Policies set for favorite_jobs.');

        // 4. Policies for RESUME_ANALYSES
        await sql`drop policy if exists "Users can view own analyses" on public.resume_analyses`;
        await sql`create policy "Users can view own analyses" on public.resume_analyses for select using (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can insert own analyses" on public.resume_analyses`;
        await sql`create policy "Users can insert own analyses" on public.resume_analyses for insert with check (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can delete own analyses" on public.resume_analyses`;
        await sql`create policy "Users can delete own analyses" on public.resume_analyses for delete using (auth.uid() = user_id)`;

        console.log('✅ Policies set for resume_analyses.');

        // 5. Policies for DOCUMENTS
        await sql`alter table public.documents enable row level security`;

        await sql`drop policy if exists "Users can view own documents" on public.documents`;
        await sql`create policy "Users can view own documents" on public.documents for select using (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can insert own documents" on public.documents`;
        await sql`create policy "Users can insert own documents" on public.documents for insert with check (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can delete own documents" on public.documents`;
        await sql`create policy "Users can delete own documents" on public.documents for delete using (auth.uid() = user_id)`;

        console.log('✅ Policies set for documents.');

    } catch (error) {
        console.error('❌ Error setting up RLS:', error);
    } finally {
        await sql.end();
    }
}

main();
