import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { 
  securityMiddleware,
  publicRouteMiddleware,
  authRouteMiddleware,
  apiRouteMiddleware,
  uploadRouteMiddleware
} from '@/middleware/security'

export async function middleware(request: NextRequest) {
  // Determine which security middleware to use based on path
  const path = request.nextUrl.pathname
  
  // Public routes (no CSRF protection)
  if (path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/objekt') || path.startsWith('/demo-')) {
    return publicRouteMiddleware(request, async (req) => {
      return await updateSession(req)
    })
  }
  
  // Auth routes (strict security)
  if (path.startsWith('/auth/callback')) {
    return authRouteMiddleware(request, async (req) => {
      return await updateSession(req)
    })
  }
  
  // API routes
  if (path.startsWith('/api/')) {
    // Allow dev test routes to bypass CSRF to simplify E2E auth bootstrap
    if ((process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_ROUTES === 'true') &&
        (path.startsWith('/api/test/create-user') || path.startsWith('/api/test/login') || path.startsWith('/api/test/create-objekt'))) {
      return await updateSession(request)
    }
    // Treat file upload endpoints as upload routes (separate rate limit & CSRF handling)
    if (path.match(/^\/api\/properties\/.+\/images(\/signed-url)?$/)) {
      return uploadRouteMiddleware(request, async (req) => {
        return await updateSession(req)
      })
    }
    return apiRouteMiddleware(request, async (req) => {
      return await updateSession(req)
    })
  }
  
  // Default security for all other routes
  return securityMiddleware(request, async (req) => {
    return await updateSession(req)
  })
}

export const config = {
  matcher: [
    // Apply to everything except static assets and the transcribe endpoint
    '/((?!_next/static|_next/image|favicon.ico|api/transcribe|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 