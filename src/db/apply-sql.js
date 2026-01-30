
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log("Connecting to database...");
    const sql = postgres(process.env.DATABASE_URL, {
        ssl: { rejectUnauthorized: false }, // Often needed for Supabase pooler/direct
        prepare: false, // Access to raw query
    });

    try {
        console.log("Reading SQL file...");
        const sqlContent = fs.readFileSync(path.join(__dirname, 'supabase_setup.sql'), 'utf8');

        // Split by semicolon to execute statements individually if needed, 
        // but postgres.js generally handles script execution if passed as a single string 
        // depending on the driver. Let's try executing the whole block.
        // If it fails on multiple statements, we might need to split them.
        // Actually, 'postgres' library `sql.file` is good for this, but let's just pass string.

        console.log("Executing SQL schema...");

        // Note: The simple `sql` function works as a tagged template literal, or a function 
        // accepting a string. `sql(string)` might treat it as a parameter. 
        // `sql.unsafe(string)` is usually the way to run raw strings.
        await sql.unsafe(sqlContent);

        console.log("✅ SQL applied successfully!");
    } catch (error) {
        console.error("❌ Error applying SQL:", error);
    } finally {
        await sql.end();
    }
}

run();
