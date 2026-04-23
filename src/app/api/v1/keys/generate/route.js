import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
    }

    // Verificar si el usuario tiene el tier correcto
    const { data: profile, error: errProfile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    if (errProfile || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (profile.tier !== 'creator_pro') {
      return NextResponse.json({ error: 'Se requiere plan Creator Pro para generar llaves API' }, { status: 403 });
    }

    // Generar llave de API segura
    const pureKey = crypto.randomBytes(32).toString('hex');
    const apiKey = `tc_live_${pureKey}`;

    // Desactivar llaves anteriores (Lógica de 1 llave activa por usuario en MVP)
    await supabase
      .from('api_keys')
      .update({ status: 'revoked' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Insertar nueva llave en BD
    const { data: newKey, error: errInsert } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        api_key: apiKey,
        status: 'active'
      })
      .select()
      .single();

    if (errInsert) {
      console.error('Insert API Key Error:', errInsert);
      return NextResponse.json({ error: 'Error interno guardando llave' }, { status: 500 });
    }

    return NextResponse.json({ apikey: newKey.api_key });

  } catch (err) {
    console.error('Generate Key Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
