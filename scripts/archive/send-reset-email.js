const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendPasswordResetEmail() {
  console.log('Sending password reset email to rani.shakir@hotmail.com...\n');

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    'rani.shakir@hotmail.com',
    {
      redirectTo: 'http://localhost:3002/auth/callback?type=recovery',
    }
  );

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Password reset email sent successfully!');
    console.log('\nNext steps:');
    console.log('1. Check the email inbox for rani.shakir@hotmail.com');
    console.log('2. Click the reset link in the email');
    console.log('3. You will be redirected to set a new password');
    console.log('\nNote: The link will expire in 1 hour.');
  }
}

sendPasswordResetEmail();