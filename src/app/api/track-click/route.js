import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { TrackClickUseCase } from '@/core/product/application/TrackClickUseCase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.next();
  }

  try {
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const useCase = new TrackClickUseCase(repository);

    const result = await useCase.execute(id);

    // Redirect to the real affiliate link
    let finalUrl = result.affiliate_link;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }

    return NextResponse.redirect(finalUrl);

  } catch (err) {
    console.error('Unexpected error in track-click:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

