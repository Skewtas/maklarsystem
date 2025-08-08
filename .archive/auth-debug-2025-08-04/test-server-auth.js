// Simple server-side test of the auth function
const { createClient } = require('@supabase/supabase-js');

// Use the same environment variables as the app
const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDM4MDYsImV4cCI6MjA2ODk3OTgwNn0._XbxA1gBizntXcVKTQOW8BDDljRmFM6PxNGXrojjVv8';

async function testAuth() {
  console.log('🧪 Testing Supabase auth directly...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    
    // Test basic connection
    const { data: health, error: healthError } = await supabase
      .from('_health')
      .select('*')
      .limit(1);
    
    if (healthError && healthError.code !== '42P01') { // 42P01 = table doesn't exist, which is expected
      console.log('❌ Connection test failed:', healthError);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Test authentication with the same credentials
    console.log('🔐 Testing login with credentials...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: 'Test123!'
    });
    
    if (error) {
      console.log('❌ Auth Error Details:');
      console.log('   Code:', error.status || 'No status');
      console.log('   Message:', error.message);
      console.log('   Full Error Object:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Authentication successful!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
      console.log('   Email Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.log('💥 Unexpected Error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

testAuth();