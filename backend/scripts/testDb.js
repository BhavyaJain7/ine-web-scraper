require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    process.exit(1);
  }

  console.log(`Testing connection to Supabase project: ${supabaseUrl}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // A simple query to check connection - fetching 1 row from tracked_products
    const { data, error } = await supabase.from('tracked_products').select('*').limit(1);
    
    if (error) {
      throw error;
    }

    console.log('✅ Connection successful!');
    console.log(`Currently tracking ${data.length} product(s) (limited to 1 in this check).`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
