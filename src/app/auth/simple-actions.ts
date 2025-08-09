'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function simpleLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/login?message=Missing email or password')
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=' + encodeURIComponent(error.message))
    }

    return redirect('/')
  } catch (error) {
    console.error('Login error:', error)
    return redirect('/login?message=An error occurred during login')
  }
}