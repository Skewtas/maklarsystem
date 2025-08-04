import { NextResponse } from 'next/server'

export async function GET() {
  // Only return non-sensitive information about environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    supabaseUrl: hasSupabaseUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL : null,
    supabaseAnonKey: hasSupabaseAnonKey ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
    hasEnvVars: hasSupabaseUrl && hasSupabaseAnonKey
  })
}