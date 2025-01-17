const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test connection
(async () => {
  const { error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Unable to connect to Supabase:', error.message);
  } else {
    console.log('Successfully connected to Supabase!');
  }
})();

module.exports = supabase;
