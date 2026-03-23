import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const q1 = "ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;";
  const q2 = "ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('moda-hombre', 'moda-mujer', 'tech', 'entretenimiento', 'suscripciones'));";
  const q3 = "ALTER TABLE products DROP CONSTRAINT IF EXISTS products_affiliate_source_check;";
  const q4 = "ALTER TABLE products ADD CONSTRAINT products_affiliate_source_check CHECK (affiliate_source IN ('amazon', 'shein', 'otros'));";

  // Try to use a hypothetical RPC to run raw SQL
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { query: q1 + q2 + q3 + q4 });
  if (error) {
    console.error("RPC failed:", error);
    console.log("Please run this manually in Supabase SQL editor:\n" + q1 + "\n" + q2 + "\n" + q3 + "\n" + q4);
  } else {
    console.log("Migration applied successfully!");
  }
}
main();
