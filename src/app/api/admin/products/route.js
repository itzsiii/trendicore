import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseProductRepository } from '@/core/product/infrastructure/adapters/SupabaseProductRepository';
import { GetProductsUseCase } from '@/core/product/application/GetProductsUseCase';
import { CreateProductUseCase } from '@/core/product/application/CreateProductUseCase';
import { UpdateProductUseCase } from '@/core/product/application/UpdateProductUseCase';
import { DeleteProductUseCase } from '@/core/product/application/DeleteProductUseCase';
import { User } from '@/core/user/domain/User';
import { PERMISSIONS } from '@/core/user/domain/Permissions';
import { CheckPermissionUseCase } from '@/core/user/application/CheckPermissionUseCase';
import { SupabaseAuthRepository } from '@/core/user/infrastructure/adapters/SupabaseAuthRepository';
import { SupabasePermissionRepository } from '@/core/user/infrastructure/adapters/SupabasePermissionRepository';

// Create a Supabase client that can verify any user's token
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  
  const supabaseAuth = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !authUser) return null;

  const authRepository = new SupabaseAuthRepository(supabaseAdmin);
  const profile = await authRepository.getUserProfile(authUser.id);
  
  if (!profile?.role) {
    console.error(`No profile/role found for user ${authUser.id}. Denying access.`);
    return null;
  }

  return new User({
    id: authUser.id,
    email: authUser.email,
    role: profile.role,
    lastSignInAt: authUser.last_sign_in_at
  });
}

// GET all products
export async function GET(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
  const checkPermission = new CheckPermissionUseCase(permissionRepository);
  if (!await checkPermission.execute(user, PERMISSIONS.VIEW_PENDING)) {
    // Si no puede ver pendientes, tal vez solo pueda ver publicados. 
    // Por ahora, Co-Admin y Admin pueden ver todo. Staff no tiene VIEW_PENDING?
    // User dijo: "staff no puede ver lo que hay en revisiones".
    // Así que filtramos por status='published' si no tiene el permiso.
  }

  try {
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const getProductsUseCase = new GetProductsUseCase(repository);
    let products = await getProductsUseCase.execute();

    // Filtro dinámico basado en permisos
    if (!await checkPermission.execute(user, PERMISSIONS.VIEW_PENDING)) {
      products = products.filter(p => p.status === 'published' || p.created_by === user.id);
    }

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

  const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
  const checkPermission = new CheckPermissionUseCase(permissionRepository);
  if (!await checkPermission.execute(user, PERMISSIONS.CREATE_PRODUCT)) {
    return NextResponse.json({ error: 'No tienes permiso para subir productos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const repository = new SupabaseProductRepository(supabaseAdmin);
    const createProductUseCase = new CreateProductUseCase(repository);
    
    // El staff siempre crea productos en estado 'draft' (revisión)
    const initialStatus = user.role === 'admin' ? (body.status || 'published') : 'draft';
    
    await createProductUseCase.execute({ 
      ...body, 
      created_by: user.id,
      status: initialStatus
    });
    
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
    const product = await repository.findById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
    const checkPermission = new CheckPermissionUseCase(permissionRepository);
    
    // Regla: Si intenta publicar y no es Admin, denegar
    if (productData.status === 'published' && !await checkPermission.execute(user, PERMISSIONS.PUBLISH_PRODUCT)) {
       return NextResponse.json({ error: 'No tienes permiso para publicar productos' }, { status: 403 });
    }

    // Regla: Edición de otros
    const canEditOther = await checkPermission.execute(user, PERMISSIONS.EDIT_ANY_PRODUCT);
    const isOwner = product.created_by === user.id;

    if (!canEditOther && !isOwner) {
       return NextResponse.json({ error: 'No tienes permiso para editar productos ajenos' }, { status: 403 });
    }

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
    const product = await repository.findById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
    const checkPermission = new CheckPermissionUseCase(permissionRepository);
    const canDeleteAny = await checkPermission.execute(user, PERMISSIONS.DELETE_ANY_PRODUCT);
    const isOwner = product.created_by === user.id;

    if (!canDeleteAny && !isOwner) {
       return NextResponse.json({ error: 'No tienes permiso para borrar productos ajenos' }, { status: 403 });
    }

    const deleteProductUseCase = new DeleteProductUseCase(repository);
    await deleteProductUseCase.execute(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
