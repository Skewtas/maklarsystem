// Reset user password for testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQwMzgwNiwiZXhwIjoyMDY4OTc5ODA2fQ.VJpbRNAtkJIsp4heAt4gZu2KZqItxYi7RCJ1XgvETIs';

async function resetUserPassword() {
  console.log('🔄 Resetting user password for testing...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Update the user's password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      'c6598ca2-a75c-4259-bc7a-8ed770cc55f0', // User ID from previous check
      {
        password: 'Test123!'
      }
    );
    
    if (error) {
      console.log('❌ Error updating password:', error.message);
      return;
    }
    
    console.log('✅ Password updated successfully!');
    console.log('📧 User email:', data.user.email);
    console.log('🔒 New password: Test123!');
    
    // Test the login immediately
    console.log('\n🧪 Testing login with new password...');
    
    const clientSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDM4MDYsImV4cCI6MjA2ODk3OTgwNn0._XbxA1gBizntXcVKTQOW8BDDljRmFM6PxNGXrojjVv8');
    
    const { data: authData, error: authError } = await clientSupabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: 'Test123!'
    });
    
    if (authError) {
      console.log('❌ Login test failed:', authError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('👤 Logged in as:', authData.user.email);
    }
    
  } catch (error) {
    console.log('💥 Unexpected Error:', error.message);
  }
}

resetUserPassword();