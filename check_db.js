const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('--- DATABASE STATUS ---');
    console.log('Total products:', data.length);
    data.forEach(p => {
      console.log(`- ${p.title} (Created by: ${p.created_by || 'NULL'})`);
    });
  }
}

check();
