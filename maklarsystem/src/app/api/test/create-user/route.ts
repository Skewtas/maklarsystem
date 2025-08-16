import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    // Extra safeguard: disable in production unless explicitly allowed
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_ROUTES !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const url = new URL(req.url)
    const email = url.searchParams.get('email') || process.env.E2E_TEST_EMAIL
    const password = url.searchParams.get('password') || process.env.E2E_TEST_PASSWORD || 'testpassword123'

    if (!email) {
      return NextResponse.json({ error: 'email missing' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check if user exists
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const found = existing.users.find(u => u.email?.toLowerCase() === String(email).toLowerCase())

    if (found) {
      // Ensure password is set to the provided one for E2E consistency
      await admin.auth.admin.updateUserById(found.id, { password: String(password) })
      return NextResponse.json({ ok: true, created: false, updated: true, id: found.id })
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: String(email),
      password: String(password),
      email_confirm: true,
      user_metadata: { full_name: 'E2E Test User' }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, created: true, id: data.user?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}


