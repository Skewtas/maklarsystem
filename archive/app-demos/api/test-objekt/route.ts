import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get user (assuming we're logged in)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    // Create a test user session
    const { data: { user: testUser }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }
  }
  
  return NextResponse.json({ message: 'Test objekt created' })
}