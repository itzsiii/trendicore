import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Supabase client filters automatically handle session cookies if configured,
    // but in Next.js App Router we often need to manage them or use the middleware.
    // For now, since we are refactoring, we'll return the session.
    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
