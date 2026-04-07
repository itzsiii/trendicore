import { createClient } from '@supabase/supabase-js';

// Hardcoded for quick debug since it's a local dev environment
const supabaseUrl = 'https://knpuquzmgwbcltaxilfp.supabase.co';
const supabaseAnonKey = 'sb_publishable_0Bxlj7UVri3VYhizsgeVWg_QdI3RI69';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProducts() {
  console.log('Checking all products...');
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log(`Found ${data.length} products total.`);
    if (data.length > 0) {
      console.log('Sample regions:', [...new Set(data.map(p => p.region))]);
      console.log('Sample categories:', [...new Set(data.map(p => p.category))]);
    }
  }
}

checkProducts();
