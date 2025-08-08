const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmV1ZXdzcmdhdnpzYmRuZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQwMzgwNiwiZXhwIjoyMDY4OTc5ODA2fQ.VJpbRNAtkJIsp4heAt4gZu2KZqItxYi7RCJ1XgvETIs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAuthPermissions() {
  console.log('Fixing auth.users table permissions...');
  
  try {
    // Test current permissions by trying to read users
    const { data: users, error: readError } = await supabase.auth.admin.listUsers();
    
    if (readError) {
      console.error('Error reading users:', readError);
    } else {
      console.log('Successfully read users. Count:', users.users.length);
    }
    
    // Find Rani's user
    const rani = users?.users.find(u => u.email === 'rani.shakir@hotmail.com');
    if (rani) {
      console.log('Found Rani user:', {
        id: rani.id,
        email: rani.email,
        created_at: rani.created_at,
        last_sign_in_at: rani.last_sign_in_at
      });
      
      // Try to update the user's metadata to test write permissions
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        rani.id,
        {
          user_metadata: { 
            ...rani.user_metadata,
            test_permission_update: new Date().toISOString()
          }
        }
      );
      
      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        console.log('\nThe permissions issue needs to be fixed in the Supabase dashboard:');
        console.log('1. Go to https://supabase.com/dashboard/project/exreuewsrgavzsbdnghv/editor');
        console.log('2. Run the following SQL in the SQL Editor:');
        console.log(`
-- Grant necessary permissions to the auth admin role
GRANT UPDATE ON auth.users TO supabase_auth_admin;
GRANT SELECT ON auth.users TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin;
        `);
      } else {
        console.log('Successfully updated user metadata - permissions appear to be working!');
      }
    }
    
    // Now test login
    console.log('\nTesting login with fixed permissions...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: '69179688AA'
    });
    
    if (loginError) {
      console.error('Login error:', loginError);
    } else {
      console.log('Login successful!', {
        user: loginData.user?.email,
        session: !!loginData.session
      });
      
      // Sign out to clean up
      await supabase.auth.signOut();
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixAuthPermissions();