import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SupabaseAuthRepository } from '@/core/user/infrastructure/adapters/SupabaseAuthRepository';
import { CheckSessionUseCase } from '@/core/user/application/CheckSessionUseCase';

export async function GET() {
  const authRepository = new SupabaseAuthRepository(supabase);
  const checkSessionUseCase = new CheckSessionUseCase(authRepository);
  
  const result = await checkSessionUseCase.execute();

  if (!result.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(result);
}
