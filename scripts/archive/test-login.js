const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login for rani.shakir@hotmail.com...\n');

  // Test with different passwords
  const passwords = ['Welcome123!', 'password123', 'Password123!', 'password'];

  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: password
    });

    if (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    } else {
      console.log(`✅ Success! Logged in with password: ${password}`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      
      // Sign out
      await supabase.auth.signOut();
      return;
    }
  }

  console.log('\n❌ None of the tested passwords worked.');
  console.log('\nTo reset the password, you can:');
  console.log('1. Use the "Forgot password?" link on the login page');
  console.log('2. Or go to Supabase Dashboard > Authentication > Users');
  console.log('3. Find rani.shakir@hotmail.com and click "Send recovery email"');
}

testLogin();