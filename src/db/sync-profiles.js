import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

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
        console.log('🔄 Syncing profiles from auth.users...');

        // Access auth schema requires postgres role (which we have)

        // Select users who do NOT have a profile
        const usersWithoutProfiles = await sql`
      select id, email, raw_user_meta_data
      from auth.users
      where id not in (select id from public.profiles)
    `;

        console.log(`Found ${usersWithoutProfiles.length} users needing profiles.`);

        for (const user of usersWithoutProfiles) {
            const meta = user.raw_user_meta_data || {};

            console.log(`Creating profile for ${user.email} (${user.id})...`);

            await sql`
        insert into public.profiles (id, email, first_name, last_name, image_url)
        values (
          ${user.id}, 
          ${user.email}, 
          ${meta.first_name || ''}, 
          ${meta.last_name || ''}, 
          ${meta.avatar_url || ''}
        )
      `;
        }

        console.log('✅ Sync completed.');

        // Also verifying RLS just in case since user mentioned "database empty"
        console.log('Checking RLS policies...');
        const result = await sql`
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'favorite_jobs';
    `;
        console.log('favorite_jobs RLS enabled:', result[0]?.rowsecurity);


    } catch (error) {
        console.error('❌ Error syncing profiles:', error);
    } finally {
        await sql.end();
    }
}

main();
