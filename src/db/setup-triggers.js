import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    try {
        console.log('Creating handle_new_user function...');
        await sql`
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.profiles (id, email, first_name, last_name, image_url)
        values (
          new.id, 
          new.email, 
          new.raw_user_meta_data ->> 'first_name', 
          new.raw_user_meta_data ->> 'last_name', 
          new.raw_user_meta_data ->> 'avatar_url'
        );
        return new;
      end;
      $$;
    `;

        console.log('Creating on_auth_user_created trigger...');
        // Drop trigger if exists to avoid errors on run-twice
        await sql`drop trigger if exists on_auth_user_created on auth.users`;
        await sql`
      create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    `;

        console.log('✅ Trigger setup completed successfully.');
    } catch (error) {
        console.error('Error setting up triggers:', error);
    } finally {
        await sql.end();
    }
}

main();
