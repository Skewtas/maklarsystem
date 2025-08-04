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

async function testAuth() {
  try {
    // Lista alla användare
    console.log('Fetching all users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error fetching users:', listError);
      return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });

    // Hitta Rani's användare
    const raniUser = users.find(u => u.email === 'rani.shakir@hotmail.com');
    
    if (raniUser) {
      console.log('\nUser rani.shakir@hotmail.com exists!');
      console.log('User ID:', raniUser.id);
      console.log('Created at:', raniUser.created_at);
      console.log('Email confirmed:', raniUser.email_confirmed_at ? 'Yes' : 'No');
      
      // Försök uppdatera lösenordet med en annan metod
      console.log('\nAttempting to update password...');
      
      // Skapa en magic link istället
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: 'rani.shakir@hotmail.com',
      });

      if (error) {
        console.error('Error generating recovery link:', error);
      } else {
        console.log('\n✅ Recovery link generated!');
        console.log('Use this link to set a new password:');
        console.log(data.properties.action_link);
      }
    } else {
      console.log('\nUser rani.shakir@hotmail.com not found!');
      console.log('Creating new user...');
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'rani.shakir@hotmail.com',
        password: 'Welcome123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Rani Shakir'
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
      } else {
        console.log('User created successfully!');
        console.log('User ID:', authData.user.id);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuth();