import { createClient } from '../utils/supabase/server'

async function investigateDatabase() {
  const supabase = await createClient()
  
  console.log('=== Investigating Users Table Dependencies ===\n')
  
  // 1. Check current users table structure
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'users')
    .order('ordinal_position')
  
  if (columnsError) {
    console.error('Error checking columns:', columnsError)
  } else {
    console.log('Current users table structure:')
    console.table(columns)
  }
  
  // 2. Check foreign key constraints
  const { data: constraints, error: constraintsError } = await supabase.rpc('get_foreign_key_constraints', {
    p_table_name: 'users'
  })
  
  if (constraintsError) {
    console.log('\nChecking constraints manually...')
    // Try a simpler query
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
    } else {
      console.log('\nSample users:')
      console.table(users)
    }
  } else {
    console.log('\nForeign key constraints:')
    console.table(constraints)
  }
  
  // 3. Check if required columns exist
  const requiredColumns = ['id', 'email', 'name', 'role', 'företag', 'active', 'created_at', 'updated_at']
  const existingColumns = columns?.map((col: any) => col.column_name) || []
  const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
  
  if (missingColumns.length > 0) {
    console.log('\n⚠️  Missing columns:', missingColumns)
  } else {
    console.log('\n✅ All required columns exist')
  }
  
  // 4. Safe update - add missing columns
  console.log('\n=== Applying Safe Updates ===\n')
  
  for (const column of missingColumns) {
    let columnDef = ''
    switch (column) {
      case 'role':
        columnDef = "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"
        break
      case 'name':
        columnDef = "ALTER TABLE users ADD COLUMN name TEXT"
        break
      case 'active':
        columnDef = "ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true"
        break
      case 'företag':
        columnDef = "ALTER TABLE users ADD COLUMN företag TEXT"
        break
      default:
        continue
    }
    
    console.log(`Adding column: ${column}`)
    const { error } = await supabase.rpc('exec_sql', { sql: columnDef })
    if (error) {
      console.error(`Error adding ${column}:`, error)
    } else {
      console.log(`✅ Added ${column}`)
    }
  }
  
  // 5. Update existing users
  console.log('\n=== Updating User Records ===\n')
  
  // Update Rani
  const { error: raniError } = await supabase
    .from('users')
    .upsert({
      id: 'a0eebc99-3c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'rani@restate.se',
      name: 'Rani Shakir',
      role: 'admin',
      företag: 'Restate AB',
      active: true
    })
    .eq('id', 'a0eebc99-3c0b-4ef8-bb6d-6bb9bd380a11')
  
  if (raniError) {
    console.error('Error updating Rani:', raniError)
  } else {
    console.log('✅ Updated Rani')
  }
  
  // Update Anna
  const { error: annaError } = await supabase
    .from('users')
    .upsert({
      id: 'b1ffcc88-2d1a-5fe7-cc5e-5cc8ce271b22',
      email: 'anna@restate.se',
      name: 'Anna Example',
      role: 'user',
      företag: 'Restate AB',
      active: true
    })
    .eq('id', 'b1ffcc88-2d1a-5fe7-cc5e-5cc8ce271b22')
  
  if (annaError) {
    console.error('Error updating Anna:', annaError)
  } else {
    console.log('✅ Updated Anna')
  }
  
  // 6. Final verification
  console.log('\n=== Final Verification ===\n')
  
  const { data: finalUsers, error: finalError } = await supabase
    .from('users')
    .select('id, email, name, role, företag, active')
    .order('created_at')
  
  if (finalError) {
    console.error('Error fetching final users:', finalError)
  } else {
    console.log('Current users in database:')
    console.table(finalUsers)
  }
  
  console.log('\n✅ Investigation and update complete!')
}

investigateDatabase().catch(console.error)