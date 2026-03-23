import { cookies } from 'next/headers';
import HomeClient from './HomeClient';
import { supabase } from '@/lib/supabase';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';

export default async function HomePage() {
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get('trendicore-region');
  const region = regionCookie?.value || 'es'; // default to es

  const repository = new SupabaseProductRepository(supabase);
  const useCase = new GetProductsUseCase(repository);

  const [initialFeatured, initialLatest, initialSubscriptions] = await Promise.all([
    useCase.execute({ featured: true, region, limit: 6, status: 'published' }),
    useCase.execute({ region, limit: 12, status: 'published' }),
    useCase.execute({ category: 'suscripciones', region, limit: 6, status: 'published' })
  ]);

  return (
    <HomeClient
      initialFeatured={initialFeatured}
      initialLatest={initialLatest}
      initialSubscriptions={initialSubscriptions}
      serverRegion={region}
    />
  );
}
