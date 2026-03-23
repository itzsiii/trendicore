import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    console.log('No products found, checking table definition via RPC if available or trying insert...');
    // If no products, we can try to insert a dummy and see if it works
    const { error: insertError } = await supabase
      .from('products')
      .insert([{ title: 'Temp', price: 0, category: 'tech', affiliate_link: 'http://test.com', image_url: 'http://test.com', country: 'Test' }]);
    
    if (insertError) {
       if (insertError.message.includes('column "country" of relation "products" does not exist')) {
         console.log('COLUMN_MISSING: country');
       } else {
         console.error('Insert error:', insertError);
       }
    } else {
      console.log('COLUMN_EXISTS: country (Successfully inserted test)');
      // Cleanup
      await supabase.from('products').delete().eq('title', 'Temp');
    }
  }
}

checkColumns();
