import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  // Never expose in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 404 })
  }

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  const host = (() => {
    try {
      const u = new URL(url)
      return u.host
    } catch {
      return ''
    }
  })()

  let serviceValid = false
  let serviceError: string | undefined
  try {
    const admin = createAdminClient()
    // Minimal query to validate credentials (no secrets returned)
    const { error } = await admin.from('objekt').select('id').limit(1)
    serviceValid = !error
    if (error) serviceError = error.message
  } catch (e: any) {
    serviceValid = false
    serviceError = e?.message || String(e)
  }

  return NextResponse.json({
    success: true,
    urlHost: host,
    urlMatchesProject: /kwxxpypgtdfimmxnipaz\.supabase\.co$/.test(host),
    anonPresent: Boolean(anon),
    servicePresent: Boolean(service),
    serviceValid,
    // Do not return key values
    note: 'Keys are not exposed. This endpoint only validates presence and ability to query.'
  })
}





