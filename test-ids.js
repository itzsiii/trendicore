// commonjs script to test
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.from('products').select('id, title, status, affiliate_link').limit(1);
  console.log('PRODUCTS DIRECT FROM DB:');
  console.dir(data, { depth: null });
  if (error) console.error(error);
}

run();
