import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseStorageAdapter } from '@/core/storage/infrastructure/adapters/SupabaseStorageAdapter';
import { UploadProductImageUseCase } from '@/core/storage/application/UploadProductImageUseCase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  
  const supabaseAuth = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const { data: { user } } = await supabaseAuth.auth.getUser(token);
  return user;
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    const storageAdapter = new SupabaseStorageAdapter(supabaseAdmin);
    const uploadUseCase = new UploadProductImageUseCase(storageAdapter);

    const result = await uploadUseCase.execute(file);

    return NextResponse.json({ url: result.url });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error uploading file' }, { status: 400 });
  }
}

