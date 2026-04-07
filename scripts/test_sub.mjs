import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabaseAdmin.from('products').insert({
    title: 'Netflix Premium (Ejemplo)',
    price: 0,
    category: 'suscripciones',
    affiliate_link: 'https://netflix.com',
    affiliate_source: 'otros',
    region: 'es',
    image_url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86d2eb?q=80&w=400',
    status: 'published',
    featured: false
  });

  if (error) console.error('Error:', error);
  else console.log('Suscripción generada con éxito');
}

main();
