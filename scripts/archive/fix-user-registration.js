const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixUserRegistration() {
  console.log('🔧 Fixing user registration setup...\n')

  try {
    // 1. Check if trigger exists
    console.log('1. Checking if trigger exists...')
    const { data: triggers, error: triggerError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          tgname AS trigger_name,
          tgenabled
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
      `
    })
    
    if (triggerError) {
      console.error('Error checking trigger:', triggerError)
    } else {
      console.log('Trigger status:', triggers)
    }

    // 2. Fix RLS policies
    console.log('\n2. Fixing RLS policies...')
    
    // Drop existing policies
    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
      `
    })

    // Create new insert policy
    const { error: policyError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Users can insert their own profile"
        ON public.users
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
      `
    })

    if (policyError) {
      console.error('Error creating policy:', policyError)
    } else {
      console.log('✅ Insert policy created')
    }

    // Create service role bypass policy
    const { error: bypassError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Service role bypass"
        ON public.users
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
      `
    })

    if (bypassError) {
      console.error('Error creating bypass policy:', bypassError)
    } else {
      console.log('✅ Service role bypass policy created')
    }

    // 3. Ensure RLS is enabled
    console.log('\n3. Enabling RLS on public.users...')
    const { error: rlsError } = await supabase.rpc('sql', {
      query: `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled')
    }

    // 4. Grant permissions
    console.log('\n4. Granting permissions...')
    const { error: grantError } = await supabase.rpc('sql', {
      query: `
        GRANT INSERT ON public.users TO postgres;
        GRANT INSERT ON public.users TO service_role;
        GRANT USAGE ON SCHEMA public TO authenticated;
        GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
      `
    })

    if (grantError) {
      console.error('Error granting permissions:', grantError)
    } else {
      console.log('✅ Permissions granted')
    }

    // 5. Test the setup
    console.log('\n5. Testing the setup...')
    const { data: testResult, error: testError } = await supabase.rpc('sql', {
      query: `
        DO $$
        DECLARE
            test_user_id uuid := gen_random_uuid();
        BEGIN
            -- Test inserting into public.users
            INSERT INTO public.users (
                id,
                email,
                full_name,
                role,
                created_at,
                updated_at
            )
            VALUES (
                test_user_id,
                'rls-test@example.com',
                'RLS Test User',
                'maklare',
                now(),
                now()
            );
            
            -- If successful, clean up
            DELETE FROM public.users WHERE id = test_user_id;
            
            RAISE NOTICE 'RLS test successful!';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'RLS test error: %', SQLERRM;
        END $$;
      `
    })

    if (testError) {
      console.error('Test error:', testError)
    } else {
      console.log('✅ RLS test passed')
    }

    // 6. List all current policies
    console.log('\n6. Current policies on public.users:')
    const { data: policies, error: policiesError } = await supabase.rpc('sql', {
      query: `
        SELECT 
            polname AS policy_name,
            polcmd AS command,
            polroles AS roles
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      `
    })

    if (policiesError) {
      console.error('Error listing policies:', policiesError)
    } else {
      console.log(policies)
    }

    console.log('\n✨ User registration setup fixed!')
    console.log('\nYou can now test user registration at http://localhost:3000/login')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Check if we're using the service role key
async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || user) {
    console.error('This script must be run with the service role key, not a user key')
    process.exit(1)
  }
}

checkAuth().then(() => fixUserRegistration())