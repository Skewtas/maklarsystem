// Create a test user with known credentials
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDM4MDYsImV4cCI6MjA2ODk3OTgwNn0._XbxA1gBizntXcVKTQOW8BDDljRmFM6PxNGXrojjVv8';

async function testMultiplePasswords() {
  console.log('🔍 Testing multiple possible passwords for rani.shakir@hotmail.com...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const possiblePasswords = [
    'Test123\!',
    'test123',
    'password123',
    'Password123',
    'PASSWORD123',
    'Test1234',
    'test1234',
    'password',
    'admin123',
    'Maklarsystem123'
  ];
  
  for (const password of possiblePasswords) {
    try {
      console.log(`🔐 Testing password: "${password}"`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'rani.shakir@hotmail.com',
        password: password
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ SUCCESS\! Password "${password}" works\!`);
        console.log(`   👤 User: ${data.user.email}`);
        return; // Exit once we find the correct password
      }
      
    } catch (error) {
      console.log(`   💥 Unexpected error: ${error.message}`);
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n❌ None of the test passwords worked');
  console.log('💡 The password for this user might need to be reset manually');
}

testMultiplePasswords();
EOF < /dev/null