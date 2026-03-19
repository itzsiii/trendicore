import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAuthRepository } from '@/core/user/infrastructure/adapters/SupabaseAuthRepository';
import { CheckSessionUseCase } from '@/core/user/application/CheckSessionUseCase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export async function GET(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const authRepository = new SupabaseAuthRepository(supabaseAuth);
  const checkSessionUseCase = new CheckSessionUseCase(authRepository);
  
  const result = await checkSessionUseCase.execute();

  if (!result.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(result);
}
