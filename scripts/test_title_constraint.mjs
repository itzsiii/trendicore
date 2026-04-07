import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const testTitle = 'Test Title ' + Date.now();
  
  console.log('Inserting first product with title:', testTitle);
  const { data: p1, error: e1 } = await supabaseAdmin.from('products').insert({
    title: testTitle,
    image_url: 'https://example.com/img1.jpg',
    price: 10,
    category: 'tech',
    affiliate_link: 'https://example.com/link1-' + Date.now(),
    affiliate_source: 'otros'
  }).select();

  if (e1) {
    console.error('Error p1:', e1);
    return;
  }
  console.log('P1 inserted:', p1[0].id);

  console.log('Inserting second product with same title...');
  const { data: p2, error: e2 } = await supabaseAdmin.from('products').insert({
    title: testTitle,
    image_url: 'https://example.com/img2.jpg',
    price: 20,
    category: 'tech',
    affiliate_link: 'https://example.com/link2-' + Date.now(),
    affiliate_source: 'otros'
  }).select();

  if (e2) {
    console.log('Error p2 (expected if unique title):', e2.code, e2.message);
  } else {
    console.log('P2 inserted unexpectedly!', p2[0].id);
  }

  // Cleanup
  if (p1 && p1[0]) await supabaseAdmin.from('products').delete().eq('id', p1[0].id);
  if (p2 && p2[0]) await supabaseAdmin.from('products').delete().eq('id', p2[0].id);
}

test();
