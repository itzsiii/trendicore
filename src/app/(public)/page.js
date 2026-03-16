import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get('trendicore-region');
  const region = regionCookie?.value || 'es'; // default to es

  let featuredQuery = supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('region', region)
    .order('created_at', { ascending: false })
    .limit(6);

  let latestQuery = supabase
    .from('products')
    .select('*')
    .eq('region', region)
    .order('created_at', { ascending: false })
    .limit(12);

  const [featuredRes, latestRes] = await Promise.all([featuredQuery, latestQuery]);

  const initialFeatured = featuredRes.data || [];
  const initialLatest = latestRes.data || [];

  return (
    <HomeClient
      initialFeatured={initialFeatured}
      initialLatest={initialLatest}
      serverRegion={region}
    />
  );
}
