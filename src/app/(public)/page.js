import { cookies } from 'next/headers';
import HomeClient from './HomeClient';
import { supabase } from '@/lib/supabase';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';

export default async function HomePage() {
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get('trendicore-region');
  const region = regionCookie?.value || 'es';

  let initialFeatured = [];

  try {
    const repository = new SupabaseProductRepository(supabase);
    const useCase = new GetProductsUseCase(repository);
    initialFeatured = await useCase.execute({ featured: true, region, limit: 4, status: 'published' });
  } catch (err) {
    console.error('Home SSR fetch error:', err.message);
  }

  return (
    <HomeClient
      initialFeatured={initialFeatured}
      serverRegion={region}
    />
  );
}
