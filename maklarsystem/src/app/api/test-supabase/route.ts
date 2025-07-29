import { NextResponse } from 'next/server'
import { testSupabaseConnection, checkTables } from '@/lib/test-supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const connectionTest = await testSupabaseConnection()
    
    // Check if tables exist
    const tableCheck = await checkTables()
    
    return NextResponse.json({
      connection: connectionTest,
      tables: tableCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to test Supabase connection' },
      { status: 500 }
    )
  }
} 