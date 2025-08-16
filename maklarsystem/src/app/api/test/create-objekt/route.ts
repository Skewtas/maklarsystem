import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_ROUTES !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const admin = createAdminClient()
    const body = await req.json().catch(() => ({} as any))
    const {
      email = process.env.E2E_TEST_EMAIL || 'anna.andersson@maklarsystem.se',
      adress = `E2E ${Date.now()} Testgatan 1`,
      postnummer = '12345',
      ort = 'Stockholm',
      kommun = 'Stockholm',
      lan = 'Stockholm',
      typ = 'lagenhet',
      status = 'kundbearbetning',
      beskrivning = null
    } = body || {}

    // Lookup maklare_id by email via Auth admin (more reliable in tests)
    const authUsers = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const found = authUsers.data?.users.find(u => u.email?.toLowerCase() === String(email).toLowerCase())
    if (!found?.id) {
      return NextResponse.json({ error: 'user_not_found', details: 'auth user not found' }, { status: 400 })
    }

    // Ensure application user exists in public.users (FK target for objekt.maklare_id)
    const { data: appUser, error: appUserErr } = await admin
      .from('users')
      .select('id')
      .eq('id', found.id)
      .single()

    if (appUserErr) {
      // If not found, insert a basic profile row
      const insertUserPayload = {
        id: found.id,
        email: String(found.email || email),
        full_name: (found.user_metadata as any)?.full_name || 'E2E Test User',
        role: 'maklare' as const,
        phone: (found.user_metadata as any)?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { error: insUserErr } = await admin.from('users').insert(insertUserPayload)
      if (insUserErr) {
        return NextResponse.json({ error: 'failed_to_prepare_user', details: insUserErr.message }, { status: 400 })
      }
    }

    const insertPayload: any = {
      typ,
      adress,
      postnummer,
      ort,
      kommun,
      lan,
      status,
      maklare_id: found.id,
      beskrivning
    }

    const { data, error } = await admin
      .from('objekt')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}



