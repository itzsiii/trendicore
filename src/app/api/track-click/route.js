import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.next();
  }

  try {
    // 1. Fetch the product to get current clicks and the real link
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('affiliate_link, clicks')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      console.error('Error fetching product for tracking:', fetchError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Increment clicks asynchronously (don't block the redirect)
    // We use a small background task conceptually, or just await it if we want to be safe
    // Since Vercel servers might kill the process after response, it's safer to await it
    // If 'clicks' column doesn't exist yet, this will fail but the redirect still happens
    try {
      const currentClicks = product.clicks || 0;
      await supabaseAdmin
        .from('products')
        .update({ clicks: currentClicks + 1 })
        .eq('id', id);
    } catch (updateError) {
      console.error('Failed to update clicks (column might be missing):', updateError);
    }

    // 3. Redirect to the real affiliate link
    // Ensure the link has http/https
    let finalUrl = product.affiliate_link;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }

    return NextResponse.redirect(finalUrl);

  } catch (err) {
    console.error('Unexpected error in track-click:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
