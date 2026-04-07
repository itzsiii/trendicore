import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Add description column to products table
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    query: "ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';"
  });

  if (error) {
    console.error("RPC failed:", error);
    console.log("\nPlease run this manually in Supabase SQL editor:");
    console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';");
  } else {
    console.log("Migration applied successfully! 'description' column added.");
  }
}

main();
