import { NextResponse } from 'next/server';
import { URLMetadataService } from '@/core/product/infrastructure/services/URLMetadataService';

/**
 * POST /api/admin/products/extract
 * Extracts product metadata from a provided URL.
 */
export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'Se requiere una URL' }, { status: 400 });
    }

    const service = new URLMetadataService();
    const metadata = await service.extract(url);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('API Extraction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
