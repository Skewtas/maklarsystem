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
    
    // Try to update Rani's password directly using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '263fefed-dac0-433f-a169-5d7fa2823dc7', // Rani's ID from auth.users
      {
        password: 'testpassword123'
      }
    )

    if (error) {
      return NextResponse.json({ 
        error: 'Error updating password', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}