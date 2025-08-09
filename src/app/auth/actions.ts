'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Type-safe form data extraction
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string,
  }

  // Validate required fields
  if (!data.email || !data.password || !data.full_name) {
    redirect('/login?message=Missing required fields')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    redirect('/login?message=Invalid email format')
  }

  // Validate password strength
  if (data.password.length < 6) {
    redirect('/login?message=Password must be at least 6 characters')
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
        }
      }
    })

    if (error) {
      console.error('Signup error:', error)
      redirect('/login?message=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email to confirm your account')
  } catch (error) {
    console.error('Signup error:', error)
    redirect('/login?message=An error occurred during signup')
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-safe form data extraction
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate required fields
  if (!data.email || !data.password) {
    redirect('/login?message=Missing email or password')
  }

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error.message)
      redirect('/login?message=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Unexpected login error:', error)
    redirect('/login?message=An error occurred during login')
  }
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  
  if (!email) {
    redirect('/login?message=E-postadress krävs')
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/login?message=Ogiltig e-postadress')
  }
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/auth/callback`,
      }
    })
    
    if (error) {
      console.error('Magic link error:', error)
      redirect('/login?message=' + encodeURIComponent(error.message))
    }
    
    redirect('/login?message=Kontrollera din e-post för inloggningslänken')
  } catch (error) {
    console.error('Magic link error:', error)
    redirect('/login?message=Ett fel uppstod vid sändning av inloggningslänk')
  }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
    throw new Error('Failed to sign out')
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}