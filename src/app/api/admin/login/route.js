import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SupabaseAuthRepository } from '@/core/user/infrastructure/adapters/SupabaseAuthRepository';
import { LoginUseCase } from '@/core/user/application/LoginUseCase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const authRepository = new SupabaseAuthRepository(supabase);
    const loginUseCase = new LoginUseCase(authRepository);

    const result = await loginUseCase.execute(email, password);

    // Supabase client filters automatically handle session cookies if configured,
    // but in Next.js App Router we often need to manage them or use the middleware.
    // For now, since we are refactoring, we'll return the session.
    return NextResponse.json({ success: true, user: result.user });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 401 });
  }
}
