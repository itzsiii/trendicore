import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';
import { SupabasePermissionRepository } from '@/core/user/infrastructure/adapters/SupabasePermissionRepository';
import { GetRolePermissionsUseCase } from '@/core/user/application/GetRolePermissionsUseCase';
import { UpdateRolePermissionsUseCase } from '@/core/user/application/UpdateRolePermissionsUseCase';
import { SupabaseAuthRepository } from '@/core/user/infrastructure/adapters/SupabaseAuthRepository';
import { User } from '@/core/user/domain/User';
import { PERMISSIONS } from '@/core/user/domain/Permissions';
import { CheckPermissionUseCase } from '@/core/user/application/CheckPermissionUseCase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  
  const supabaseAuth = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !authUser) return null;

  const authRepository = new SupabaseAuthRepository(supabaseAdmin);
  const profile = await authRepository.getUserProfile(authUser.id);
  
  return new User({
    id: authUser.id,
    email: authUser.email,
    role: profile?.role || 'staff',
    lastSignInAt: authUser.last_sign_in_at
  });
}

export async function GET(request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Solo Admin puede gestionar roles
  const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
  const checkPermission = new CheckPermissionUseCase(permissionRepository);
  
  if (!await checkPermission.execute(user, PERMISSIONS.MANAGE_ROLES)) {
    return NextResponse.json({ error: 'No tienes permiso para gestionar roles' }, { status: 403 });
  }

  try {
    const useCase = new GetRolePermissionsUseCase(permissionRepository);
    const permissions = await useCase.execute();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('[API Permissions GET Error]:', error);
    return NextResponse.json({ 
      error: error.message,
      detail: 'Error al obtener todos los permisos desde el repositorio'
    }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissionRepository = new SupabasePermissionRepository(supabaseAdmin);
  const checkPermission = new CheckPermissionUseCase(permissionRepository);
  
  if (!await checkPermission.execute(user, PERMISSIONS.MANAGE_ROLES)) {
    return NextResponse.json({ error: 'No tienes permiso para gestionar roles' }, { status: 403 });
  }

  try {
    const { role, permissions } = await request.json();
    const useCase = new UpdateRolePermissionsUseCase(permissionRepository);
    await useCase.execute(role, permissions);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
