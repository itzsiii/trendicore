import { supabase } from './src/lib/supabase.js';

async function checkSubscriptions() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, category')
    .eq('category', 'suscripciones');

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return;
  }

  console.log('Subscriptions with prices:', JSON.stringify(data, null, 2));
}

checkSubscriptions();
