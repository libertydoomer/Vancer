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

        console.log('✅ RLS Enabled on profiles and favorite_jobs.');

        // 2. Policies for PROFILES
        // Allow users to view their own profile (or all profiles if public)
        // Let's assume public profiles for now, but editable only by owner.
        await sql`drop policy if exists "Public profiles are viewable by everyone" on public.profiles`;
        await sql`create policy "Public profiles are viewable by everyone" on public.profiles for select using (true)`;

        await sql`drop policy if exists "Users can update own profile" on public.profiles`;
        await sql`create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id)`;

        // Note: Insert is handled by the Trigger (security definer), so no normal insert policy needed for users usually, 
        // unless you want them to manually create profiles. Triggers bypass RLS if using security definer functions, 
        // but the trigger event is on auth.users (system) and inserts into profiles (public).
        // The previous trigger function uses `security definer`, so it bypasses RLS.

        console.log('✅ Policies set for profiles.');

        // 3. Policies for FAVORITE_JOBS
        // Users can only view/create/delete their own favorites.
        await sql`drop policy if exists "Users can view own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can view own favorites" on public.favorite_jobs for select using (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can insert own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can insert own favorites" on public.favorite_jobs for insert with check (auth.uid() = user_id)`;

        await sql`drop policy if exists "Users can delete own favorites" on public.favorite_jobs`;
        await sql`create policy "Users can delete own favorites" on public.favorite_jobs for delete using (auth.uid() = user_id)`;

        console.log('✅ Policies set for favorite_jobs.');

    } catch (error) {
        console.error('❌ Error setting up RLS:', error);
    } finally {
        await sql.end();
    }
}

main();
