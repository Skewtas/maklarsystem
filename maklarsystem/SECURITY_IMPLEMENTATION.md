# Säkerhet & Performance Implementation - Mäklarsystem

## Översikt

Detta dokument beskriver säkerhets- och prestandafunktioner som implementerats i Fas 5 av Mäklarsystem-projektet.

## Säkerhetsfunktioner

### 1. Rate Limiting

Rate limiting skyddar API:et mot överbelastning och DDoS-attacker.

#### Användning i API Routes

```typescript
import { withRateLimit, apiRateLimiter } from '@/lib/security';

export async function GET(req: NextRequest) {
  return withRateLimit(req, async (req) => {
    // Din API-logik här
    return NextResponse.json({ data: 'success' });
  }, apiRateLimiter);
}
```

#### Fördefinierade Rate Limiters

- `apiRateLimiter`: 60 förfrågningar per minut
- `authRateLimiter`: 5 inloggningsförsök per 15 minuter
- `uploadRateLimiter`: 100 uppladdningar per timme

#### Anpassad Rate Limiter

```typescript
import { createRateLimiter } from '@/lib/security';

const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minuter
  maxRequests: 20,
  message: 'För många förfrågningar från denna IP',
});
```

### 2. Input Sanitization

Sanitering av användarinput för att förhindra XSS-attacker.

#### Automatisk sanitering i validering

```typescript
import { validateApp } from '@/lib/validation/middleware/validate';

const validate = validateApp({
  body: kontaktSchema,
}, {
  sanitization: {
    enabled: true,
    profile: 'moderate' // 'strict', 'moderate', eller 'minimal'
  }
});
```

#### Manuell sanitering

```typescript
import { sanitizeFormData, sanitizeSwedishText } from '@/lib/security';

// Sanitera ett objekt
const cleanData = sanitizeFormData(userData, 'moderate');

// Sanitera svensk text (bevarar å, ä, ö)
const cleanText = sanitizeSwedishText(userInput);
```

### 3. CSRF Protection

Skydd mot Cross-Site Request Forgery attacker.

#### I React-komponenter

```typescript
import { useCSRF, useCSRFField } from '@/hooks/useCSRF';

function MyForm() {
  const { token, getHeaders } = useCSRF();
  const csrfField = useCSRFField();
  
  const handleSubmit = async (data: FormData) => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input {...csrfField} />
      {/* Andra formulärfält */}
    </form>
  );
}
```

#### I API Routes

```typescript
import { withCSRFProtection } from '@/lib/security';

export async function POST(req: NextRequest) {
  return withCSRFProtection(req, async (req) => {
    // Din POST-logik här
    return NextResponse.json({ success: true });
  });
}
```

### 4. Security Headers

Automatiska säkerhetshuvuden för alla svar.

#### Headers som läggs till:

- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

#### Användning

```typescript
import { withSecurityHeaders } from '@/lib/security';

export async function GET(req: NextRequest) {
  return withSecurityHeaders(req, async (req) => {
    return NextResponse.json({ data: 'secure' });
  });
}
```

### 5. Kombinerad säkerhet

Använd alla säkerhetsfunktioner tillsammans:

```typescript
import { securityMiddleware } from '@/middleware/security';

export async function POST(req: NextRequest) {
  return securityMiddleware(req, async (req) => {
    // Din säkra API-logik
    return NextResponse.json({ success: true });
  }, {
    rateLimit: { enabled: true, type: 'api' },
    csrf: { enabled: true },
    sanitization: { enabled: true, profile: 'moderate' },
    headers: { enabled: true }
  });
}
```

## Prestandaoptimeringar

### 1. Response Caching

LRU-cache för API-svar.

```typescript
import { apiCache } from '@/lib/performance';

export async function GET(req: NextRequest) {
  return apiCache.withCache(req, async (req) => {
    // Tung databasoperation
    const data = await fetchExpensiveData();
    return NextResponse.json(data);
  });
}
```

### 2. Query Optimization

Optimerade databasfrågor med caching.

```typescript
import { createOptimizedQuery } from '@/lib/performance/database';

const query = createOptimizedQuery(supabase);

const result = await query
  .from('objekt')
  .withOptions({
    cache: { enabled: true, ttl: 60000 },
    pagination: { page: 1, pageSize: 20 },
    optimize: {
      selectOnly: ['id', 'adress', 'pris'],
      includeCount: true
    }
  })
  .select()
  .filter('status', 'eq', 'active')
  .order('created_at', { ascending: false })
  .paginate()
  .execute();
```

### 3. Response Compression

Automatisk gzip-komprimering av svar.

```typescript
import { withCompression } from '@/lib/performance';

export async function GET(req: NextRequest) {
  return withCompression(req, async (req) => {
    const largeData = await fetchLargeDataset();
    return NextResponse.json(largeData);
  });
}
```

## Exempel: Säker API-endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApp } from '@/lib/validation/middleware/validate';
import { securityMiddleware } from '@/middleware/security';
import { apiCache, createOptimizedQuery } from '@/lib/performance';
import { createClient } from '@/utils/supabase/server';

const querySchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
});

const validate = validateApp({ query: querySchema });

export async function GET(req: NextRequest) {
  // Applicera alla säkerhetsfunktioner
  return securityMiddleware(req, async (req) => {
    // Använd caching
    return apiCache.withCache(req, async (req) => {
      // Validera input
      const validation = await validate(req);
      if (validation instanceof NextResponse) return validation;
      
      const supabase = createClient();
      const query = createOptimizedQuery(supabase);
      
      // Optimerad databas-query
      const result = await query
        .from('kontakter')
        .withOptions({
          cache: { enabled: true },
          pagination: { page: 1, pageSize: 20 }
        })
        .select()
        .execute();
      
      return NextResponse.json(result);
    });
  });
}
```

## Migration Guide

### Uppdatera befintliga API routes

1. Lägg till rate limiting:
   ```typescript
   return withRateLimit(req, handler, apiRateLimiter);
   ```

2. Lägg till CSRF-skydd för POST/PUT/DELETE:
   ```typescript
   return withCSRFProtection(req, handler);
   ```

3. Aktivera sanitering i validering:
   ```typescript
   const validate = validateApp(schemas, {
     sanitization: { enabled: true }
   });
   ```

### Uppdatera React-formulär

1. Lägg till CSRF-token:
   ```typescript
   const { getHeaders } = useCSRF();
   ```

2. Använd säkra headers i fetch:
   ```typescript
   fetch(url, { headers: getHeaders() });
   ```

## Säkerhetsrekommendationer

1. **Använd alltid rate limiting** på publika API:er
2. **Aktivera CSRF-skydd** för alla state-changing operations
3. **Sanitera all användarinput** innan validering
4. **Implementera caching** för read-heavy endpoints
5. **Använd cursor-based pagination** för stora dataset
6. **Komprimera stora svar** för bättre prestanda

## Felsökning

### Rate Limit överskriden
- Kontrollera `X-RateLimit-*` headers för information
- Vänta tiden specificerad i `Retry-After` header

### CSRF-fel
- Kontrollera att token skickas i headers eller body
- Verifiera att cookies är aktiverade
- Ladda om sidan för att få ny token

### Prestandaproblem
- Kontrollera cache hit rate
- Verifiera att rätt index används i databasen
- Använd `selectOnly` för att minska data transfer