const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const email = 'coadmin@test.com';
  const role = 'co-admin';

  console.log('--- DB Fix & User Creation ---');

  // 1. Force schema cache refresh by selecting
  console.log('1. Re-checking profiles table visibility...');
  const { data: checkData, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (checkError) {
    console.log('❌ Error selecting from profiles:', checkError.message);
    console.log('Trying one more time to "wake it up"...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const { error: retryError } = await supabase.from('profiles').select('id').limit(1);
    if (retryError) {
       console.error('❌ Still failing. Please run "NOTIFY pgrst, \'reload schema\'" in Supabase SQL Editor.');
       return;
    }
  }
  console.log('✅ Table "profiles" is visible.');

  // 2. Find User in Auth
  console.log(`2. Searching for user ${email}...`);
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }
  
  const user = userList.users.find(u => u.email === email);
  if (!user) {
    console.log('   User not found. Creating in Auth...');
    const { data: newData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'Trendicore2026!',
      email_confirm: true
    });
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return;
    }
    console.log(`✅ User created: ${newData.user.id}`);
    await setRole(newData.user.id, email, role);
  } else {
    console.log(`✅ User found: ${user.id}`);
    await setRole(user.id, email, role);
  }
}

async function setRole(userId, email, role) {
  console.log(`3. Setting role "${role}" for ${email}...`);
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, role, updated_at: new Date().toISOString() });

  if (error) {
    console.error('❌ Error updating profile:', error.message);
  } else {
    console.log('✨ SUCCESS! Co-admin user is ready.');
  }
}

run();
