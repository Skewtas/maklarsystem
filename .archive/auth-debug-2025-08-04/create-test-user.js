const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    const testEmail = 'test@maklarsystem.se';
    const testPassword = 'Test123!';
    
    console.log(`Creating test user: ${testEmail}`);
    
    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      
      // If user exists, try to delete and recreate
      if (authError.message.includes('already exists')) {
        console.log('User already exists, trying to delete first...');
        
        // Get user ID
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === testEmail);
        
        if (existingUser) {
          // Delete user
          const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
          
          if (deleteError) {
            console.error('Error deleting user:', deleteError);
          } else {
            console.log('User deleted, creating new one...');
            
            // Try creating again
            const { data: newAuthData, error: newAuthError } = await supabase.auth.admin.createUser({
              email: testEmail,
              password: testPassword,
              email_confirm: true,
              user_metadata: {
                full_name: 'Test User'
              }
            });
            
            if (newAuthError) {
              console.error('Error creating user after delete:', newAuthError);
            } else {
              console.log('✅ User created successfully!');
              console.log('User ID:', newAuthData.user.id);
              await createPublicUser(newAuthData.user.id, testEmail);
            }
          }
        }
      }
    } else {
      console.log('✅ User created successfully!');
      console.log('User ID:', authData.user.id);
      await createPublicUser(authData.user.id, testEmail);
    }
    
    console.log('\n📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('\nNow try logging in with these credentials!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function createPublicUser(userId, email) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: email,
      full_name: 'Test User',
      role: 'maklare'
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error creating public user:', error);
  } else {
    console.log('✅ User record created in public.users table');
  }
}

createTestUser();