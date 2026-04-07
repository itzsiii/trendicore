const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTables() {
  console.log('Checking only "profiles" table...');
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.log(`❌ Table "profiles": ${error.message}`);
    console.log(`Error details: ${JSON.stringify(error)}`);
  } else {
    console.log(`✅ Table "profiles" exists. Row count: ${count}`);
  }
}

debugTables();
