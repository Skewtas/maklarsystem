const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exreuewsrgavzsbdnghv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDM4MDYsImV4cCI6MjA2ODk3OTgwNn0._XbxA1gBizntXcVKTQOW8BDDljRmFM6PxNGXrojjVv8'
);

async function testLogin() {
  console.log('🔍 Final test: trying to create a new test user and login...');
  
  // Create a new test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('1. Creating new test user...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signupError) {
      console.log('❌ Signup failed:', signupError.message);
      return;
    }
    
    console.log('✅ User created:', testEmail);
    
    // Immediately try to sign in (this should work even without email confirmation in most setups)
    console.log('2. Testing login with new user...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signinError) {
      console.log('❌ Login failed:', signinError.message);
      console.log('   This suggests the Supabase auth is working, but may require email confirmation');
    } else {
      console.log('✅ Login successful!');
      console.log('   User ID:', signinData.user.id);
      console.log('   Email:', signinData.user.email);
    }
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

testLogin();