import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const testLink = 'https://example.com/test-link-' + Date.now();
  
  console.log('Inserting first product...');
  const { data: p1, error: e1 } = await supabaseAdmin.from('products').insert({
    title: 'Test Product 1 ' + Date.now(),
    image_url: 'https://example.com/img1.jpg',
    price: 10,
    category: 'tech',
    affiliate_link: testLink,
    affiliate_source: 'otros'
  }).select();

  if (e1) {
    console.error('Error p1:', e1);
    return;
  }
  console.log('P1 inserted:', p1[0].id);

  console.log('Inserting second product with same link...');
  const { data: p2, error: e2 } = await supabaseAdmin.from('products').insert({
    title: 'Test Product 2 ' + Date.now(),
    image_url: 'https://example.com/img2.jpg',
    price: 20,
    category: 'tech',
    affiliate_link: testLink,
    affiliate_source: 'otros'
  }).select();

  if (e2) {
    console.log('Error p2 (expected if unique link):', e2.code, e2.message);
  } else {
    console.log('P2 inserted unexpectedly!', p2[0].id);
  }

  // Cleanup
  if (p1) await supabaseAdmin.from('products').delete().eq('id', p1[0].id);
  if (p2) await supabaseAdmin.from('products').delete().eq('id', p2[0].id);
}

test();
