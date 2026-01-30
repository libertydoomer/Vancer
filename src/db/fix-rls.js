import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    try {
        console.log('🔒 Re-enabling RLS and fixing policies...');

        // 1. Enable RLS
        await sql`alter table public.favorite_jobs enable row level security`;

        // 2. Drop existing policies to be clean
        await sql`drop policy if exists "Users can insert own favorites" on public.favorite_jobs`;
        await sql`drop policy if exists "Enable insert for authenticated users only" on public.favorite_jobs`;

        // 3. Create a correct permissive INSERT policy
        // We explicitly allow authenticated users to insert rows where user_id matches their own ID.
        await sql`
      create policy "Enable insert for authenticated users only"
      on public.favorite_jobs for insert
      to authenticated
      with check (auth.uid() = user_id);
    `;

        // 4. Create SELECT policy (View own)
        await sql`drop policy if exists "Enable read access for own favorites" on public.favorite_jobs`;
        await sql`
      create policy "Enable read access for own favorites"
      on public.favorite_jobs for select
      to authenticated
      using (auth.uid() = user_id);
    `;

        // 5. Create DELETE policy
        await sql`drop policy if exists "Enable delete for own favorites" on public.favorite_jobs`;
        await sql`
      create policy "Enable delete for own favorites"
      on public.favorite_jobs for delete
      to authenticated
      using (auth.uid() = user_id);
    `;

        console.log('✅ RLS Policies Fixed. Authenticated users can now CRUD their own favorites.');

    } catch (error) {
        console.error('❌ Error fixing RLS:', error);
    } finally {
        await sql.end();
    }
}

main();
