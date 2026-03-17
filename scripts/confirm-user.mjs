import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Cargar variables desde .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan variables de entorno en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmUser(email) {
  console.log(`Buscando usuario con email: ${email}...`);
  
  // 1. Buscar al usuario por email para obtener su ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error al listar usuarios:', listError);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`No se encontró ningún usuario con el email: ${email}`);
    return;
  }

  console.log(`Usuario encontrado (ID: ${user.id}). Confirmando email...`);

  // 2. Actualizar el usuario para marcar el email como confirmado
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (error) {
    console.error('Error al confirmar usuario:', error);
  } else {
    console.log(`✅ ¡Éxito! El usuario ${email} ha sido confirmado manualmente.`);
    console.log('Ya puede iniciar sesión sin errores.');
  }
}

// Obtener el email del argumento o usar el por defecto
const emailToConfirm = process.argv[2] || 'trabajador1@test.com';
confirmUser(emailToConfirm);
