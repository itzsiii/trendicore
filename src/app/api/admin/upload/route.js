import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return token && token.value;
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl });
}
