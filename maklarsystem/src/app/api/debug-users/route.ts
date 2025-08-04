import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check both tables
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', 'anna.andersson@maklarsystem.se')
    
    if (publicError) {
      return NextResponse.json({ 
        error: 'Error checking public users', 
        details: publicError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      publicUsers,
      success: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}