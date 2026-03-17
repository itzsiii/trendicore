import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';
import TiendaClient from './TiendaClient';

export const metadata = {
  title: 'Tienda — Trendicore',
  description: 'Explora todo nuestro catálogo de tendencias Gen Z, moda aesthetic y tech viral.',
};

export default async function TiendaPage() {
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get('trendicore-region');
  const region = regionCookie?.value || 'es';

  const repository = new SupabaseProductRepository(supabase);
  const useCase = new GetProductsUseCase(repository);

  // Fetch initial products (first page or all published for now)
  const initialProducts = await useCase.execute({
    region,
    status: 'published',
    limit: 24
  });

  return (
    <TiendaClient 
      initialProducts={initialProducts} 
      serverRegion={region} 
    />
  );
}
