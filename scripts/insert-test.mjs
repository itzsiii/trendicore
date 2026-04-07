import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knpuquzmgwbcltaxilfp.supabase.co';
const supabaseServiceKey = 'sb_secret_bVQweHSkeIkaIjGA5meM8w_CAJ-eGMz';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestProduct() {
  console.log('Inserting test product...');
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        title: 'Test Product ES',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        price: 29.99,
        category: 'tech',
        affiliate_link: 'https://amazon.es',
        affiliate_source: 'amazon',
        region: 'es',
        featured: true
      }
    ])
    .select();
  
  if (error) console.error('Error inserting product:', error);
  else console.log('Successfully inserted test product:', data[0].id);
}

insertTestProduct();
