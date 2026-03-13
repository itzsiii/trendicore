import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Create a Supabase client that can verify any user's token
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUser(request) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  
  // Create a temporary client with the user's token
  const supabaseAuth = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const { data: { user } } = await supabaseAuth.auth.getUser(token);
  return user;
}

// GET all products
export async function GET(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST create product
export async function POST(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin
    .from('products')
    .insert([{ ...body, created_by: user.id }]);

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un producto con este nombre.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PUT update product
export async function PUT(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...productData } = body;

  // Use supabaseAdmin (service role) to bypass any RLS/trigger issues
  const { error } = await supabaseAdmin
    .from('products')
    .update(productData)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE product
export async function DELETE(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
