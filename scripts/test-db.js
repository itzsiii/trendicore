const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProducts() {
  console.log('Checking products for region: es');
  const { data: esProducts, error: esError } = await supabase
    .from('products')
    .select('*')
    .eq('region', 'es');
  
  if (esError) console.error('Error fetching ES products:', esError);
  else console.log(`Found ${esProducts.length} products for ES`);

  console.log('Checking products for region: us');
  const { data: usProducts, error: usError } = await supabase
    .from('products')
    .select('*')
    .eq('region', 'us');
  
  if (usError) console.error('Error fetching US products:', usError);
  else console.log(`Found ${usProducts.length} products for US`);

  if (esProducts.length === 0 && usProducts.length === 0) {
    console.log('Database appears to be empty.');
  } else {
    console.log('Sample product:', esProducts[0] || usProducts[0]);
  }
}

checkProducts();
