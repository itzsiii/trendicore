const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGetAll() {
  console.log('Testing getAllPermissions directly...');
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*');

  if (error) {
    console.log('Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Data found:', data.length);
    console.log('Sample row:', data[0]);
  }
}

testGetAll();
