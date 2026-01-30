import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    try {
        console.log('🪣  Checking Storage Bucket "documents"...');

        // 1. Create Bucket
        await sql`
            insert into storage.buckets (id, name, public)
            values ('documents', 'documents', true)
            on conflict (id) do nothing;
        `;
        console.log('✅ Bucket "documents" ensured.');

        // 2. Enable RLS (if not already)
        // Usually enabled by default on storage.objects

        // 3. Create Policies
        // Drop existing to avoid conflicts during dev/testing
        await sql`drop policy if exists "Authenticated users can upload documents" on storage.objects`;
        await sql`
            create policy "Authenticated users can upload documents"
            on storage.objects for insert
            with check ( bucket_id = 'documents' and auth.role() = 'authenticated' );
        `;

        await sql`drop policy if exists "Users can update their own documents" on storage.objects`;
        await sql`
            create policy "Users can update their own documents"
            on storage.objects for update
            using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );
        `;

        await sql`drop policy if exists "Users can delete their own documents" on storage.objects`;
        await sql`
            create policy "Users can delete their own documents"
            on storage.objects for delete
            using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );
        `;

        await sql`drop policy if exists "Users can select their own documents" on storage.objects`;
        await sql`
            create policy "Users can select their own documents"
            on storage.objects for select
            using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );
        `;

        console.log('✅ Storage Policies applied successfully.');

    } catch (error) {
        console.error('❌ Error creating bucket or policies:', error);
    } finally {
        await sql.end();
    }
}

main();
