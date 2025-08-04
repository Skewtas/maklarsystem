import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Test auth API called with email:', email)

    const supabase = await createClient()

    // Test connection
    const { data: testData, error: testError } = await supabase.from('test').select('*').limit(1)
    console.log('Supabase connection test in API:', { testData, testError })

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('API Login error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        cause: error.cause
      })
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: {
          status: error.status,
          code: error.code
        }
      }, { status: 401 })
    }

    console.log('API Login successful:', data.user?.email)

    return NextResponse.json({ 
      success: true, 
      user: data.user 
    })
  } catch (error) {
    console.error('Test auth API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}