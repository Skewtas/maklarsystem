import { createServerSupabaseClient } from './supabase-server'

export async function testSupabaseConnection() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single()

    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connection successful!')
    return { success: true, data }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function checkTables() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if our main tables exist
    const tables = ['users', 'objekt', 'kontakter', 'visningar', 'bud']
    const results = []

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      results.push({
        table,
        exists: !error,
        error: error?.message
      })
    }

    return results
  } catch (err) {
    console.error('Error checking tables:', err)
    return []
  }
} 