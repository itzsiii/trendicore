import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';

export async function GET(request) {
  try {
    // 1. Autorización por API Key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer tc_live_')) {
      return NextResponse.json({ error: 'No autorizado. Provea un API Key válido en el formato Bearer tc_live_...' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];

    // Verificar en la BD la llave
    const { data: keyRecord, error: errKey } = await supabase
      .from('api_keys')
      .select('id, user_id, status')
      .eq('api_key', apiKey)
      .single();

    if (errKey || !keyRecord || keyRecord.status !== 'active') {
      return NextResponse.json({ error: 'LLave API inválida o revocada.' }, { status: 401 });
    }

    // Opcional: Trackear API Usage
    // await supabase.from('api_logs').insert({ api_key_id: keyRecord.id, endpoint: '/api/v1/trends', status_code: 200, ip_address: request.headers.get('x-forwarded-for') });
    // Actualizar last_used_at
    await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRecord.id);

    // 2. Extraer Query Params locales
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Math.min(parseInt(searchParams.get('limit')), 100) : 10;
    const region = searchParams.get('region') || 'es';
    
    // 3. Ejecutar Core Logic (Reutilizando Clean Architecture Hexagon)
    const repository = new SupabaseProductRepository(supabase);
    const useCase = new GetProductsUseCase(repository);

    const filters = {
      status: 'published',
      sortBy: 'trending',
      limit,
      region
    };

    const products = await useCase.execute(filters);

    // 4. Formatear la respuesta B2B Restful
    const responseData = products.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      trend_score: p.trend_score,
      clicks: p.clicks,
      platform: p.affiliate_source,
      predicted_peak: '2026-05', // Fake data para añadir valor simulado de ML predictivo
      image_url: p.image_url,
      affiliate_url: p.affiliate_link
    }));

    return NextResponse.json({
      status: 'success',
      metadata: {
        total: responseData.length,
        region,
        served_at: new Date().toISOString()
      },
      data: responseData
    });

  } catch (err) {
    console.error('B2B API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
