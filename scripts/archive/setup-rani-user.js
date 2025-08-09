const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupRaniUser() {
  try {
    console.log('Setting up user rani.shakir@hotmail.com...');

    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'rani.shakir@hotmail.com',
      password: 'Welcome123!', // Temporary password - should be changed on first login
      email_confirm: true,
      user_metadata: {
        full_name: 'Rani Shakir'
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.code === 'email_exists' || authError.message.includes('already exists')) {
        console.log('User already exists in auth system, updating...');
        
        // Get existing user - note the correct method name
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
          console.error('Error fetching users:', listError);
          return;
        }

        // Find our user
        const existingUser = users.find(u => u.email === 'rani.shakir@hotmail.com');
        
        if (existingUser) {
          const userId = existingUser.id;
          console.log('Found existing user with ID:', userId);
          
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: 'Welcome123!'
          });

          if (updateError) {
            console.error('Error updating password:', updateError);
          } else {
            console.log('Password updated successfully');
          }

          // Ensure user exists in public.users table
          await ensurePublicUser(userId);
        } else {
          console.error('User not found in auth system');
          return;
        }
      } else {
        console.error('Error creating user:', authError);
        return;
      }
    } else {
      console.log('User created successfully in auth system');
      
      // Step 2: Create corresponding entry in public.users table
      if (authData && authData.user) {
        await ensurePublicUser(authData.user.id);
      }
    }

    console.log('\n✅ Setup complete!');
    console.log('📧 Email: rani.shakir@hotmail.com');
    console.log('🔑 Password: Welcome123!');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function ensurePublicUser(userId) {
  const { error: upsertError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: 'rani.shakir@hotmail.com',
      full_name: 'Rani Shakir',
      role: 'maklare'
    }, {
      onConflict: 'id'
    });

  if (upsertError) {
    console.error('Error creating/updating public user:', upsertError);
  } else {
    console.log('User record created/updated in public.users table');
  }
}

// Run the setup
setupRaniUser();