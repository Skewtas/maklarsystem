import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment configuration early to avoid vague runtime errors
  if (!supabaseUrl || !/^https?:\/\//.test(supabaseUrl)) {
    console.error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL is missing or invalid. Received:', supabaseUrl)
    throw new Error('Supabase misconfigured: set NEXT_PUBLIC_SUPABASE_URL to your project URL (https://xxxx.supabase.co)')
  }
  if (!supabaseAnonKey) {
    console.error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
    throw new Error('Supabase misconfigured: set NEXT_PUBLIC_SUPABASE_ANON_KEY to your project anon key')
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // List of public routes that don't require authentication
  const allowTestRoutes = process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_ROUTES === 'true'
  const publicRoutes = [
    '/login',
    '/auth',
    '/register',
    '/demo-',
    '/objekt',
    // Allow test APIs in non-production to run without auth (for E2E setup)
    ...(allowTestRoutes ? ['/api/test/create-user', '/api/test/login', '/api/test/create-objekt', '/api/test/list-objekt'] : [])
  ]
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
} 