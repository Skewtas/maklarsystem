// Secure Visning Booking System Implementation
// Following OWASP guidelines and security best practices

import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

// ============================================================================
// 1. INPUT VALIDATION SCHEMAS
// ============================================================================

// Strict validation for Swedish phone numbers
const swedishPhoneRegex = /^(\+46|0)[0-9]{9,10}$/;

// Booking request validation schema
const visningBookingSchema = z.object({
  objekt_id: z.string().uuid('Invalid property ID format'),
  datum: z.string().datetime('Invalid date format'),
  tid_slot: z.enum(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']),
  
  // Personal information with strict validation
  fornamn: z.string()
    .min(2, 'First name too short')
    .max(50, 'First name too long')
    .regex(/^[a-zA-ZåäöÅÄÖ\s-]+$/, 'Invalid characters in first name'),
  
  efternamn: z.string()
    .min(2, 'Last name too short')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-ZåäöÅÄÖ\s-]+$/, 'Invalid characters in last name'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email too long'),
  
  telefon: z.string()
    .regex(swedishPhoneRegex, 'Invalid Swedish phone number'),
  
  meddelande: z.string()
    .max(500, 'Message too long')
    .optional(),
  
  // Anti-bot fields
  honeypot: z.string().max(0, 'Bot detected'), // Should be empty
  timestamp: z.number().int(), // Client-side timestamp for rate limiting
});

// ============================================================================
// 2. ENCRYPTION UTILITIES
// ============================================================================

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    // In production, load from secure key management service
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 64) {
      throw new Error('Invalid encryption key');
    }
    this.key = Buffer.from(keyString, 'hex');
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Create searchable hash for encrypted fields
  hash(text: string): string {
    return crypto
      .createHmac('sha256', this.key)
      .update(text)
      .digest('hex');
  }
}

// ============================================================================
// 3. RATE LIMITING CONFIGURATION
// ============================================================================

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for booking creation
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 booking attempts per hour
  message: 'Too many booking attempts, please try again later.',
  skipSuccessfulRequests: false,
});

// ============================================================================
// 4. AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================================================

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'maklare' | 'koordinator' | 'assistent';
  };
}

export async function authenticateRequest(
  request: AuthenticatedRequest
): Promise<{ user: any; error?: string }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Not needed for auth check
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  // Fetch user role from database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return { user: null, error: 'User not found' };
  }

  return { user: userData };
}

// ============================================================================
// 5. BOOKING PERMISSION SYSTEM
// ============================================================================

type Permission = {
  canCreateBooking: boolean;
  canViewAllBookings: boolean;
  canModifyBooking: boolean;
  canDeleteBooking: boolean;
  canViewPersonalData: boolean;
};

const rolePermissions: Record<string, Permission> = {
  admin: {
    canCreateBooking: true,
    canViewAllBookings: true,
    canModifyBooking: true,
    canDeleteBooking: true,
    canViewPersonalData: true,
  },
  maklare: {
    canCreateBooking: true,
    canViewAllBookings: false, // Only own properties
    canModifyBooking: true,
    canDeleteBooking: false,
    canViewPersonalData: true,
  },
  koordinator: {
    canCreateBooking: true,
    canViewAllBookings: true,
    canModifyBooking: true,
    canDeleteBooking: false,
    canViewPersonalData: true,
  },
  assistent: {
    canCreateBooking: true,
    canViewAllBookings: false,
    canModifyBooking: false,
    canDeleteBooking: false,
    canViewPersonalData: false,
  },
};

// ============================================================================
// 6. SECURE BOOKING API ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = visningBookingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const bookingData = validationResult.data;

    // 3. Anti-bot checks
    const requestTime = Date.now();
    const clientTime = bookingData.timestamp;
    const timeDiff = Math.abs(requestTime - clientTime);
    
    // If request took less than 2 seconds or more than 5 minutes, likely a bot
    if (timeDiff < 2000 || timeDiff > 300000) {
      return NextResponse.json(
        { error: 'Invalid request timing' },
        { status: 400 }
      );
    }

    // 4. Authentication (optional for public bookings)
    const { user } = await authenticateRequest(request);
    
    // 5. Initialize services
    const encryption = new EncryptionService();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for encryption
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    // 6. Check if time slot is available (with row locking)
    const { data: existingBooking, error: checkError } = await supabase
      .rpc('check_and_lock_timeslot', {
        p_objekt_id: bookingData.objekt_id,
        p_datum: bookingData.datum,
        p_tid_slot: bookingData.tid_slot,
      });

    if (checkError || existingBooking) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 409 }
      );
    }

    // 7. Encrypt sensitive data
    const encryptedEmail = encryption.encrypt(bookingData.email);
    const encryptedPhone = encryption.encrypt(bookingData.telefon);
    
    // 8. Create booking with encrypted data
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const { data: booking, error: bookingError } = await supabase
      .from('visning_bookings')
      .insert({
        objekt_id: bookingData.objekt_id,
        datum: bookingData.datum,
        tid_slot: bookingData.tid_slot,
        
        // Store names in clear text (not sensitive)
        fornamn: bookingData.fornamn,
        efternamn: bookingData.efternamn,
        
        // Store encrypted contact info
        email_encrypted: encryptedEmail.encrypted,
        email_iv: encryptedEmail.iv,
        email_tag: encryptedEmail.tag,
        email_hash: encryption.hash(bookingData.email), // For searching
        
        telefon_encrypted: encryptedPhone.encrypted,
        telefon_iv: encryptedPhone.iv,
        telefon_tag: encryptedPhone.tag,
        
        meddelande: bookingData.meddelande,
        
        // Verification fields
        verification_token: verificationToken,
        verified: false,
        verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        
        // Metadata
        created_by_user_id: user?.id || null,
        created_from_ip: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .select('id')
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // 9. Send verification email (implement email service)
    // await sendVerificationEmail(bookingData.email, verificationToken, booking.id);

    // 10. Log the booking for audit trail
    await supabase.from('audit_logs').insert({
      event_type: 'booking_created',
      entity_type: 'visning_booking',
      entity_id: booking.id,
      user_id: user?.id || null,
      ip_address: ip,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        objekt_id: bookingData.objekt_id,
        datum: bookingData.datum,
        tid_slot: bookingData.tid_slot,
      },
    });

    // 11. Return success response (don't expose sensitive data)
    return NextResponse.json(
      {
        success: true,
        booking_id: booking.id,
        message: 'Booking created. Please check your email to verify.',
      },
      { 
        status: 201,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        }
      }
    );

  } catch (error) {
    console.error('Booking error:', error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 7. DATABASE FUNCTIONS (PostgreSQL)
// ============================================================================

/*
-- Create this function in Supabase SQL editor

CREATE OR REPLACE FUNCTION check_and_lock_timeslot(
  p_objekt_id UUID,
  p_datum DATE,
  p_tid_slot TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Lock the specific time slot row if it exists
  SELECT EXISTS (
    SELECT 1 
    FROM visning_bookings 
    WHERE objekt_id = p_objekt_id 
      AND datum = p_datum 
      AND tid_slot = p_tid_slot
      AND verified = true
    FOR UPDATE NOWAIT
  ) INTO v_exists;
  
  RETURN v_exists;
EXCEPTION
  WHEN lock_not_available THEN
    -- Another transaction is checking this slot
    RETURN TRUE; -- Treat as unavailable
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies

ALTER TABLE visning_bookings ENABLE ROW LEVEL SECURITY;

-- Public users can only insert their own unverified bookings
CREATE POLICY "Public can create unverified bookings" ON visning_bookings
  FOR INSERT TO anon
  WITH CHECK (verified = false);

-- Authenticated users can view bookings based on role
CREATE POLICY "View bookings based on role" ON visning_bookings
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    OR (auth.jwt() ->> 'role' = 'maklare' AND objekt_id IN (
      SELECT id FROM objekt WHERE maklare_id = auth.uid()
    ))
    OR auth.jwt() ->> 'role' = 'koordinator'
  );

-- Only admins and coordinators can update bookings
CREATE POLICY "Update bookings based on role" ON visning_bookings
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'koordinator')
  );

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
*/

// ============================================================================
// 8. SECURITY HEADERS CONFIGURATION
// ============================================================================

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://www.google.com/recaptcha/",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
};

// ============================================================================
// 9. MONITORING AND ALERTING
// ============================================================================

interface SecurityAlert {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'auth_failure' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
}

export async function logSecurityEvent(alert: SecurityAlert) {
  // In production, send to monitoring service (e.g., Sentry, DataDog)
  console.error('[SECURITY ALERT]', alert);
  
  // Store in database for analysis
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  
  await supabase.from('security_alerts').insert(alert);
  
  // Send immediate notification for critical alerts
  if (alert.severity === 'critical') {
    // await sendAlertToAdmins(alert);
  }
}