import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApp } from '@/lib/validation/middleware/validate';
import { 
  withRateLimit, 
  apiRateLimiter,
  withCSRFProtection,
  withSecurityHeaders
} from '@/lib/security';
import { apiCache } from '@/lib/performance';
import { createClient } from '@/utils/supabase/server';
import { createOptimizedQuery } from '@/lib/performance/database';

// Define validation schema
const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

// Create validation middleware
const validate = validateApp({
  query: querySchema,
}, {
  sanitization: {
    enabled: true,
    profile: 'moderate'
  }
});

// GET handler with all security features
export async function GET(req: NextRequest) {
  // Apply rate limiting
  return withRateLimit(req, async (req) => {
    // Apply security headers
    return withSecurityHeaders(req, async (req) => {
        // Apply caching
        return apiCache.withCache(req, async (req) => {
          // Validate request
          const validationResult = await validate(req);
          if (validationResult instanceof NextResponse) {
            return validationResult;
          }

          // Extract validated query params
          const searchParams = req.nextUrl.searchParams;
          const { search, status, page, limit } = {
            search: searchParams.get('search') || undefined,
            status: searchParams.get('status') as any,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
          };

          try {
            // Create Supabase client
            const supabase = await createClient();
            
            // Create optimized query
            const query = createOptimizedQuery(supabase);
            
            // Build and execute query
            const result = await query
              .from('objekt')
              .withOptions({
                cache: {
                  enabled: true,
                  ttl: 60 * 1000, // 1 minute
                },
                pagination: {
                  page,
                  pageSize: limit,
                },
                optimize: {
                  selectOnly: ['id', 'adress', 'pris', 'typ', 'status', 'created_at'],
                  includeCount: true,
                },
              })
              .select()
              .filters([
                ...(search ? [{ column: 'adress', operator: 'ilike', value: `%${search}%` }] : []),
                ...(status ? [{ column: 'status', operator: 'eq', value: status }] : []),
              ])
              .order('created_at', { ascending: false })
              .paginate()
              .execute();

            if (result.error) {
              throw result.error;
            }

            // Return response with pagination metadata
            return NextResponse.json({
              data: result.data,
              pagination: {
                page,
                limit,
                total: result.count || 0,
                hasMore: result.nextCursor !== undefined,
                nextCursor: result.nextCursor,
              },
            });
          } catch (error) {
            console.error('API Error:', error);
            return NextResponse.json(
              { error: 'Ett fel uppstod vid hämtning av data' },
              { status: 500 }
            );
          }
        });
    });
  }, apiRateLimiter);
}

// POST handler with CSRF protection
export async function POST(req: NextRequest) {
  // Apply rate limiting
  return withRateLimit(req, async (req) => {
    // Apply CSRF protection
    return withCSRFProtection(req, async (req) => {
      // Apply security headers
      return withSecurityHeaders(req, async (req) => {
          try {
            // Validate and sanitize request body
            const body = await req.json();
            
            // Your POST logic here
            // ...

            return NextResponse.json({
              success: true,
              message: 'Data har sparats',
            });
          } catch (error) {
            console.error('API Error:', error);
            return NextResponse.json(
              { error: 'Ett fel uppstod' },
              { status: 500 }
            );
          }
        });
    });
  }, apiRateLimiter);
}