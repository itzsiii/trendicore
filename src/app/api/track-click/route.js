import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.next();
  }

  try {
    // 1. Fetch the product to get current clicks and the real link
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('affiliate_link, clicks')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      console.error('Error fetching product for tracking:', fetchError);
      
      // Fallback: Check if Supabase client is initialized successfully
      const isClientReady = !!supabase && !!supabase.from;
      
      return NextResponse.json({ 
        error: 'Product not found', 
        details: fetchError?.message || 'No product data returned',
        id_received: id,
        supabase_ready: isClientReady
      }, { status: 404 });
    }

    // 2. Increment clicks asynchronously (don't block the redirect)
    try {
      const currentClicks = product.clicks || 0;
      await supabaseAdmin
        .from('products')
        .update({ clicks: currentClicks + 1 })
        .eq('id', id);
    } catch (updateError) {
      console.error('Failed to update clicks:', updateError);
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
