import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const filters = {
    region: searchParams.get('region'),
    category: searchParams.get('category'),
    featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined,
    status: 'published' // La API pública solo devuelve productos publicados
  };

  try {
    const repository = new SupabaseProductRepository(supabase);
    const useCase = new GetProductsUseCase(repository);
    
    const products = await useCase.execute(filters);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in public products API:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}
