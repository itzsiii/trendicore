import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'staff@trendicore.com';
  const password = 'StaffPassword123!';

  console.log(`Intentando crear: ${email}...`);
  const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let targetId;

  if (userError) {
    if (userError.message.includes('already') || userError.status === 422 || userError.status === 400) {
      console.log('El usuario ya existe, buscando ID...');
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users.find(u => u.email === email);
      if (existing) {
        targetId = existing.id;
        console.log(`Encontrado: ${targetId}`);
        // Reset password just in case
        await supabaseAdmin.auth.admin.updateUserById(targetId, { password });
      } else {
        console.error('Error:', userError);
        return;
      }
    } else {
      console.error('Error creando usuario:', userError);
      return;
    }
  } else {
    targetId = user.user.id;
    console.log('Usuario creado:', targetId);
  }

  // Set role to staff
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: targetId,
    role: 'staff',
  });

  if (profileError) {
    console.error('Error asignando rol en profiles:', profileError);
  } else {
    console.log('✅ ¡Cuenta STAFF configurada correctamente!');
    console.log('--- CREDENCIALES ---');
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${password}`);
  }
}
main();
