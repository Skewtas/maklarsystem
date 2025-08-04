import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { 
  securityMiddleware,
  publicRouteMiddleware,
  authRouteMiddleware,
  apiRouteMiddleware 
} from '@/middleware/security'

export async function middleware(request: NextRequest) {
  // Determine which security middleware to use based on path
  const path = request.nextUrl.pathname
  
  // Public routes (no CSRF protection)
  if (path.startsWith('/login') || path.startsWith('/auth')) {
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/transcribe (API routes that might not need auth)
     * - api/temp-auth (Temporary auth endpoint)
     * - api/test-auth (Test auth endpoint)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/transcribe|api/temp-auth|api/simple-auth|api/debug-auth|api/update-rani-password|api/delete-user|api/test-auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 