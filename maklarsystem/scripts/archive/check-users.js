// Check what users exist in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQwMzgwNiwiZXhwIjoyMDY4OTc5ODA2fQ.VJpbRNAtkJIsp4heAt4gZu2KZqItxYi7RCJ1XgvETIs';

async function checkUsers() {
  console.log('👥 Checking users in Supabase...');
  
  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: 'auth'
    }
  });
  
  try {
    // Try to get users using admin API
    console.log('🔍 Fetching users from auth.users...');
    
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`📊 Found ${users.users.length} users:`);
    
    users.users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      
      if (user.user_metadata) {
        console.log(`   Metadata: ${JSON.stringify(user.user_metadata, null, 6)}`);
      }
    });
    
    // Check if our specific user exists
    const targetUser = users.users.find(u => u.email === 'rani.shakir@hotmail.com');
    if (targetUser) {
      console.log('\n✅ Target user found!');
      if (!targetUser.email_confirmed_at) {
        console.log('⚠️  BUT: Email is not confirmed - this could be the issue!');
      }
    } else {
      console.log('\n❌ Target user "rani.shakir@hotmail.com" NOT FOUND');
      console.log('💡 This user needs to be created first');
    }
    
  } catch (error) {
    console.log('💥 Unexpected Error:', error.message);
  }
}

checkUsers();