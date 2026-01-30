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
        // 1. Temporarily disable RLS to rule it out
        console.log('⚠️  Disabling RLS on favorite_jobs temporarily for debugging...');
        await sql`alter table public.favorite_jobs disable row level security`;
        console.log('✅ RLS Disabled on favorite_jobs.');

    } catch (error) {
        console.error(error);
    } finally {
        await sql.end();
    }
}

main();
