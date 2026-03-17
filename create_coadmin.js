const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCoAdmin(email, password) {
  console.log(`🚀 Sincronizando co-admin: ${email}`);
  
  // Intentar crear
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId;

  if (authData?.user) {
    userId = authData.user.id;
    console.log(`✅ Usuario creado nuevo: ${userId}`);
  } else {
    console.log('ℹ️ El usuario ya existe o hubo un error. Buscando en la lista...');
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Error al listar usuarios:', listError.message);
      return;
    }
    const existingUser = userList.users.find(u => u.email === email);
    if (existingUser) {
      userId = existingUser.id;
      console.log(`✅ ID encontrado en Auth: ${userId}`);
    } else {
      console.error('❌ No se encontró el usuario por email.');
      return;
    }
  }

  if (userId) {
    await setProfileRole(userId, email);
  }
}

async function setProfileRole(userId, email) {
  console.log(`🔄 Asignando rol 'co-admin' en la tabla profiles...`);
  
  // Waking up schema cache
  await supabase.from('profiles').select('id').limit(1);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ 
      id: userId, 
      email: email, 
      role: 'co-admin',
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('❌ Error al asignar perfil:', profileError.message);
  } else {
    console.log('✨ ¡Éxito! Usuario co-admin listo para usar.');
  }
}

const email = process.argv[2] || 'coadmin@test.com';
const password = process.argv[3] || 'Trendicore2026!';

createCoAdmin(email, password);
