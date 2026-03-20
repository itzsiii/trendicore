import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'mabi@test.com';
  console.log(`Buscando usuario: ${email}...`);
  
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
  
  const targetUser = users.find(u => u.email === email);
  if (!targetUser) {
    console.error('No se encontró el usuario:', email);
    process.exit(1);
  }
  
  console.log('Usuario encontrado ID:', targetUser.id);
  console.log('Asignando rol "staff"...');
  
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: targetUser.id,
    email: targetUser.email,
    role: 'staff',
  });

  if (profileError) {
    console.error('Error asignando rol:', profileError);
  } else {
    console.log(`✅ ¡Rol 'staff' asignado con éxito a ${email}!`);
  }
  process.exit(0);
}

main();
