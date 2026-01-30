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
        console.log('🧪 Starting manual DB insert test...');

        // 1. Get a test user
        const users = await sql`select id, email from auth.users limit 1`;
        if (users.length === 0) {
            console.error('❌ No users found in auth.users. Cannot test insert.');
            return;
        }
        const user = users[0];
        console.log(`👤 Using user: ${user.email} (ID: ${user.id})`);

        // 2. Check if profile exists
        const profiles = await sql`select id from public.profiles where id = ${user.id}`;
        if (profiles.length === 0) {
            console.log('⚠️ Profile missing. Creating one now...');
            await sql`insert into public.profiles (id, email) values (${user.id}, ${user.email})`;
            console.log('✅ Profile created.');
        } else {
            console.log('✅ Profile exists.');
        }

        // 3. Attempt insert
        console.log('📝 Attempting to insert favorite job...');
        const testJobId = `test-${Date.now()}`;

        await sql`
      insert into public.favorite_jobs (
        user_id, 
        external_id, 
        title, 
        company, 
        description, 
        salary, 
        url, 
        location, 
        tags, 
        posted_at
      ) values (
        ${user.id}, 
        ${testJobId}, 
        'Test Job Manual Insert', 
        'Test Company', 
        'This is a test description', 
        '$100k', 
        'https://example.com', 
        'Remote', 
        ${['test', 'manual']}, 
        '2024-01-30'
      )
    `;

        console.log('🎉 INSERT SUCCESSFUL! The database is accepting writes.');
        console.log('If the app is not working, the issue is in the Next.js Server Action or Client Component.');

    } catch (error) {
        console.error('❌ INSERT FAILED:', error);
    } finally {
        await sql.end();
    }
}

main();
