import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';
import { CreateProductUseCase } from '@/core/product/application/CreateProductUseCase';
import { UpdateProductUseCase } from '@/core/product/application/UpdateProductUseCase';
import { DeleteProductUseCase } from '@/core/product/application/DeleteProductUseCase';

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

  try {
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const getProductsUseCase = new GetProductsUseCase(repository);
    const products = await getProductsUseCase.execute();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create product
export async function POST(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const createProductUseCase = new CreateProductUseCase(repository);
    
    await createProductUseCase.execute({ ...body, created_by: user.id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Ya existe')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...productData } = body;
    
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const updateProductUseCase = new UpdateProductUseCase(repository);
    
    await updateProductUseCase.execute(id, productData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const deleteProductUseCase = new DeleteProductUseCase(repository);
    
    await deleteProductUseCase.execute(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
