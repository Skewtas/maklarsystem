import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create a service role client directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
    
    if (publicError) {
      return NextResponse.json({ 
        error: 'Error checking public users', 
        details: publicError.message 
      }, { status: 500 })
    }

    // Try to create a test user for login testing
    const { data: testUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'test.login@maklarsystem.se',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Login User'
      }
    })

    return NextResponse.json({
      publicUsers,
      testUserCreated: !createError,
      testUserError: createError?.message,
      testUser: createError ? null : {
        id: testUser?.user?.id,
        email: testUser?.user?.email
      },
      success: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Create a test user for Rani
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'rani.test@matchahem.se',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Rani Test'
      }
    })

    if (error) {
      return NextResponse.json({ 
        error: 'Error creating test user', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      user: data.user,
      success: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}