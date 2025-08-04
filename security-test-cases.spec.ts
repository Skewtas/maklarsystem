// Security Test Cases for Visning Booking System
// Run with: npm test -- security-test-cases.spec.ts

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import crypto from 'crypto';

// ============================================================================
// 1. AUTHENTICATION & AUTHORIZATION TESTS
// ============================================================================

describe('Authentication Security Tests', () => {
  
  test('Should reject requests without valid session', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/visningar/book',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: {
        objekt_id: '123e4567-e89b-12d3-a456-426614174000',
        datum: '2024-02-15',
        tid_slot: '10:00'
      }
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('Should reject expired JWT tokens', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/visningar',
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Token expired');
  });

  test('Should enforce role-based access control', async () => {
    // Mock user with 'assistent' role trying to delete a booking
    const assistentToken = await generateMockToken({ role: 'assistent' });
    
    const { req, res } = createMocks({
      method: 'DELETE',
      url: '/api/visningar/123',
      headers: {
        'Authorization': `Bearer ${assistentToken}`
      }
    });

    const response = await DELETE(req);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('Should prevent privilege escalation attempts', async () => {
    const userToken = await generateMockToken({ role: 'assistent' });
    
    const { req, res } = createMocks({
      method: 'PATCH',
      url: '/api/users/self',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: {
        role: 'admin' // Trying to escalate to admin
      }
    });

    const response = await PATCH(req);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Cannot modify role');
  });
});

// ============================================================================
// 2. INPUT VALIDATION & INJECTION TESTS
// ============================================================================

describe('Input Validation Security Tests', () => {
  
  test('Should prevent SQL injection in booking form', async () => {
    const maliciousInputs = [
      "'; DROP TABLE visningar; --",
      "1' OR '1'='1",
      "admin'--",
      "1; UPDATE users SET role='admin' WHERE email='test@test.com';--"
    ];

    for (const maliciousInput of maliciousInputs) {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/visningar/book',
        body: {
          objekt_id: maliciousInput,
          fornamn: maliciousInput,
          email: 'test@test.com'
        }
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation failed');
    }
  });

  test('Should prevent XSS attacks in user input', async () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>'
    ];

    for (const payload of xssPayloads) {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/visningar/book',
        body: {
          meddelande: payload,
          fornamn: payload
        }
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      // Ensure the payload is not reflected in the response
      expect(JSON.stringify(response.body)).not.toContain(payload);
    }
  });

  test('Should validate email format strictly', async () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@@example.com',
      'user@example',
      'user name@example.com',
      'user@exam ple.com'
    ];

    for (const email of invalidEmails) {
      const response = await createBooking({ email });
      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('email');
    }
  });

  test('Should validate Swedish phone numbers', async () => {
    const validPhones = [
      '+46701234567',
      '0701234567',
      '+46-70-123-45-67'
    ];

    const invalidPhones = [
      '123456',
      '+1234567890',
      'abc123',
      '070123456', // Too short
      '07012345678' // Too long
    ];

    for (const phone of validPhones) {
      const response = await createBooking({ telefon: phone });
      expect(response.status).not.toBe(400);
    }

    for (const phone of invalidPhones) {
      const response = await createBooking({ telefon: phone });
      expect(response.status).toBe(400);
    }
  });
});

// ============================================================================
// 3. RATE LIMITING & DOS PREVENTION TESTS
// ============================================================================

describe('Rate Limiting Security Tests', () => {
  
  test('Should enforce rate limiting on API endpoints', async () => {
    const requests = [];
    
    // Make 101 requests (limit is 100 per 15 minutes)
    for (let i = 0; i < 101; i++) {
      requests.push(
        fetch('/api/visningar', {
          headers: { 'X-Forwarded-For': '192.168.1.1' }
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
    expect(rateLimitedResponses[0].headers.get('X-RateLimit-Limit')).toBe('100');
  });

  test('Should have stricter limits for booking creation', async () => {
    const bookingRequests = [];
    
    // Make 6 booking attempts (limit is 5 per hour)
    for (let i = 0; i < 6; i++) {
      bookingRequests.push(
        createBooking({
          ip: '192.168.1.2'
        })
      );
    }

    const responses = await Promise.all(bookingRequests);
    const blocked = responses.filter(r => r.status === 429);
    
    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked[0].body).toHaveProperty('error', 'Too many booking attempts');
  });

  test('Should prevent rapid-fire automated requests', async () => {
    const startTime = Date.now();
    
    // Try to make 10 requests in less than 1 second
    const rapidRequests = Array(10).fill(null).map(() =>
      createBooking({
        timestamp: startTime - 100 // Invalid timestamp (too fast)
      })
    );

    const responses = await Promise.all(rapidRequests);
    const rejected = responses.filter(r => r.status === 400);
    
    expect(rejected.length).toBe(10);
    expect(rejected[0].body.error).toContain('Invalid request timing');
  });
});

// ============================================================================
// 4. ENCRYPTION & DATA PROTECTION TESTS
// ============================================================================

describe('Data Encryption Security Tests', () => {
  
  test('Should encrypt sensitive personal data', async () => {
    const bookingData = {
      email: 'test@example.com',
      telefon: '+46701234567',
      personnummer: '199001011234'
    };

    // Create booking and check database
    const booking = await createBooking(bookingData);
    const dbRecord = await getBookingFromDB(booking.id);

    // Verify encrypted fields are not plain text
    expect(dbRecord.email_encrypted).toBeDefined();
    expect(dbRecord.email_encrypted).not.toBe(bookingData.email);
    expect(dbRecord.telefon_encrypted).toBeDefined();
    expect(dbRecord.telefon_encrypted).not.toBe(bookingData.telefon);

    // Verify encryption metadata exists
    expect(dbRecord.email_iv).toBeDefined();
    expect(dbRecord.email_tag).toBeDefined();
    expect(dbRecord.email_hash).toBeDefined();
  });

  test('Should create searchable hashes for encrypted fields', async () => {
    const email = 'unique@example.com';
    const booking1 = await createBooking({ email });
    const booking2 = await createBooking({ email });

    const db1 = await getBookingFromDB(booking1.id);
    const db2 = await getBookingFromDB(booking2.id);

    // Same email should produce same hash
    expect(db1.email_hash).toBe(db2.email_hash);
    
    // But encrypted values should be different (different IVs)
    expect(db1.email_encrypted).not.toBe(db2.email_encrypted);
  });

  test('Should handle encryption key rotation', async () => {
    // Simulate key rotation scenario
    const oldKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY_OLD = oldKey;
    process.env.ENCRYPTION_KEY = generateNewKey();

    // Should still be able to decrypt old data
    const oldBooking = await getBookingWithDecryption('old-booking-id');
    expect(oldBooking.email).toBe('test@example.com');

    // New bookings use new key
    const newBooking = await createBooking({ email: 'new@example.com' });
    const dbRecord = await getBookingFromDB(newBooking.id);
    expect(dbRecord.key_version).toBe(2);
  });
});

// ============================================================================
// 5. SESSION SECURITY TESTS
// ============================================================================

describe('Session Security Tests', () => {
  
  test('Should prevent session fixation attacks', async () => {
    const fixedSessionId = 'attacker-controlled-session-id';
    
    // Try to set a specific session ID
    const loginResponse = await login({
      email: 'user@example.com',
      password: 'password123',
      sessionId: fixedSessionId
    });

    // System should generate new session ID, not use the provided one
    expect(loginResponse.sessionId).toBeDefined();
    expect(loginResponse.sessionId).not.toBe(fixedSessionId);
  });

  test('Should invalidate sessions on logout', async () => {
    // Login and get session
    const loginResponse = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    const sessionToken = loginResponse.token;

    // Logout
    await logout(sessionToken);

    // Try to use the old session
    const response = await fetch('/api/visningar', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    expect(response.status).toBe(401);
  });

  test('Should implement secure session cookies', async () => {
    const loginResponse = await login({
      email: 'user@example.com',
      password: 'password123'
    });

    const cookies = loginResponse.headers['set-cookie'];
    
    // Check secure cookie attributes
    expect(cookies).toContain('Secure');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('SameSite=Strict');
    expect(cookies).not.toContain('Domain='); // Don't set domain for security
  });
});

// ============================================================================
// 6. CSRF PROTECTION TESTS
// ============================================================================

describe('CSRF Protection Tests', () => {
  
  test('Should reject requests without CSRF token', async () => {
    const response = await fetch('/api/visningar/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session'
        // No CSRF token
      },
      body: JSON.stringify({
        objekt_id: '123',
        datum: '2024-02-15'
      })
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Missing CSRF token');
  });

  test('Should reject requests with invalid CSRF token', async () => {
    const response = await fetch('/api/visningar/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session',
        'X-CSRF-Token': 'invalid-token'
      },
      body: JSON.stringify({
        objekt_id: '123',
        datum: '2024-02-15'
      })
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Invalid CSRF token');
  });

  test('Should accept requests with valid CSRF token', async () => {
    // Get CSRF token
    const tokenResponse = await fetch('/api/csrf-token', {
      headers: {
        'Cookie': 'session=valid-session'
      }
    });
    
    const { token } = await tokenResponse.json();

    // Use token in request
    const response = await fetch('/api/visningar/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session',
        'X-CSRF-Token': token
      },
      body: JSON.stringify(validBookingData)
    });

    expect(response.status).not.toBe(403);
  });
});

// ============================================================================
// 7. API SECURITY HEADERS TESTS
// ============================================================================

describe('Security Headers Tests', () => {
  
  test('Should include all security headers in responses', async () => {
    const response = await fetch('/api/visningar');
    
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  test('Should have proper Content Security Policy', async () => {
    const response = await fetch('/api/visningar');
    const csp = response.headers.get('Content-Security-Policy');
    
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  test('Should enforce HSTS', async () => {
    const response = await fetch('/api/visningar');
    const hsts = response.headers.get('Strict-Transport-Security');
    
    expect(hsts).toBe('max-age=63072000; includeSubDomains; preload');
  });
});

// ============================================================================
// 8. ERROR HANDLING SECURITY TESTS
// ============================================================================

describe('Error Handling Security Tests', () => {
  
  test('Should not expose internal error details', async () => {
    // Force an internal error
    const response = await fetch('/api/visningar/invalid-uuid-format');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
    
    // Should not contain stack traces or internal details
    expect(JSON.stringify(response.body)).not.toContain('stack');
    expect(JSON.stringify(response.body)).not.toContain('postgres');
    expect(JSON.stringify(response.body)).not.toContain('supabase');
  });

  test('Should log security events without exposing them', async () => {
    const suspiciousRequests = [
      { path: '/api/../../etc/passwd' },
      { path: '/api/admin' },
      { path: '/api/.git/config' }
    ];

    for (const req of suspiciousRequests) {
      const response = await fetch(req.path);
      
      // Should return generic 404, not expose path details
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not found');
      
      // But should be logged internally
      const logs = await getSecurityLogs();
      expect(logs).toContainEqual(
        expect.objectContaining({
          type: 'suspicious_path_access',
          path: req.path
        })
      );
    }
  });
});

// ============================================================================
// 9. GDPR COMPLIANCE TESTS
// ============================================================================

describe('GDPR Compliance Tests', () => {
  
  test('Should allow users to export their data', async () => {
    const userToken = await getUserToken('user@example.com');
    
    const response = await fetch('/api/gdpr/export', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Should include all personal data
    expect(data).toHaveProperty('bookings');
    expect(data).toHaveProperty('profile');
    expect(data).toHaveProperty('consent_records');
    
    // Should be in portable format
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  test('Should allow users to delete their data', async () => {
    const userToken = await getUserToken('user@example.com');
    
    const response = await fetch('/api/gdpr/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(response.status).toBe(200);
    
    // Verify data is actually deleted/anonymized
    const userData = await getUserData('user@example.com');
    expect(userData).toBeNull();
    
    // But audit logs should remain (anonymized)
    const auditLogs = await getAuditLogsForUser('user@example.com');
    expect(auditLogs[0].user_id).toBe('[DELETED]');
  });

  test('Should track consent properly', async () => {
    const consentData = {
      marketing: true,
      analytics: false,
      necessary: true
    };

    const response = await updateConsent('user@example.com', consentData);
    expect(response.status).toBe(200);
    
    // Verify consent is recorded with timestamp
    const consent = await getConsentRecords('user@example.com');
    expect(consent.latest).toMatchObject({
      ...consentData,
      timestamp: expect.any(String),
      ip_address: expect.any(String),
      user_agent: expect.any(String)
    });
  });
});

// ============================================================================
// 10. ANTI-BOT TESTS
// ============================================================================

describe('Anti-Bot Protection Tests', () => {
  
  test('Should detect and block bot-like behavior', async () => {
    // Rapid succession requests (bot-like)
    const requests = Array(10).fill(null).map(() =>
      createBooking({
        timestamp: Date.now(),
        honeypot: '' // Empty as expected
      })
    );

    // All within 100ms
    const responses = await Promise.all(requests);
    const blocked = responses.filter(r => r.status === 429 || r.status === 403);
    
    expect(blocked.length).toBeGreaterThan(5);
  });

  test('Should catch honeypot field filling', async () => {
    const response = await createBooking({
      honeypot: 'bot filled this field',
      fornamn: 'Test',
      email: 'test@test.com'
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Bot detected');
  });

  test('Should validate reCAPTCHA tokens', async () => {
    // Invalid reCAPTCHA token
    const response = await createBooking({
      recaptchaToken: 'invalid-token'
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('reCAPTCHA validation failed');
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createBooking(overrides = {}) {
  const defaultData = {
    objekt_id: '123e4567-e89b-12d3-a456-426614174000',
    datum: '2024-02-15',
    tid_slot: '10:00',
    fornamn: 'Test',
    efternamn: 'Testsson',
    email: 'test@example.com',
    telefon: '+46701234567',
    honeypot: '',
    timestamp: Date.now()
  };

  return fetch('/api/visningar/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': overrides.ip || '127.0.0.1'
    },
    body: JSON.stringify({ ...defaultData, ...overrides })
  });
}

async function generateMockToken(payload) {
  // Mock JWT generation for testing
  return 'mock-jwt-token';
}

async function login(credentials) {
  // Mock login function
  return fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

async function logout(token) {
  return fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}