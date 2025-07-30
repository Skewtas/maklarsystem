import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        })

        if (error) {
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: false,
            error: error.message
          })
          errorCount++
        } else {
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: true
          })
          successCount++
        }
      } catch (err) {
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: errorCount === 0,
      totalStatements: statements.length,
      successCount,
      errorCount,
      results
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 