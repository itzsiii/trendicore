import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const repository = new SupabaseProductRepository(supabaseAdmin);

    // 1. Only fetch the product link (fast read)
    const product = await repository.findById(id);
    if (!product) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Fire-and-forget: increment clicks without blocking the redirect
    repository.incrementClicks(id).catch(err =>
      console.error('Click tracking error (non-blocking):', err)
    );

    // 3. Redirect immediately
    let finalUrl = product.affiliate_link;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }

    return NextResponse.redirect(finalUrl, { status: 307 });
  } catch (err) {
    console.error('Unexpected error in track-click:', err);
    // Always redirect to home — never show a JSON error to end users
    return NextResponse.redirect(new URL('/', request.url));
  }
}
