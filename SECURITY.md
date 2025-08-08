# 🔒 Mäklarsystem Security & Compliance Documentation

> Version: 1.0.0  
> Last Updated: 2025-08-06  
> Classification: Internal  
> Compliance: GDPR, Swedish Data Protection Act

## 📋 Table of Contents
1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [GDPR Compliance](#gdpr-compliance)
5. [Security Controls](#security-controls)
6. [Vulnerability Management](#vulnerability-management)
7. [Incident Response](#incident-response)
8. [Compliance Checklist](#compliance-checklist)
9. [Security Architecture](#security-architecture)
10. [Audit & Monitoring](#audit--monitoring)

## 🎯 Security Overview

### Security Principles
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal access rights for users and systems
3. **Zero Trust**: Never trust, always verify
4. **Data Minimization**: Collect only necessary data
5. **Privacy by Design**: Security built into the system architecture
6. **Continuous Monitoring**: Real-time threat detection

### Compliance Requirements
- **GDPR**: EU General Data Protection Regulation
- **Swedish Data Protection Act**: Dataskyddslagen
- **PCI DSS**: Payment Card Industry standards (future)
- **ISO 27001**: Information security management (target)

### Risk Assessment Matrix
| Risk Category | Likelihood | Impact | Risk Level | Mitigation |
|--------------|------------|--------|------------|------------|
| Data Breach | Medium | High | High | Encryption, Access Control |
| Account Takeover | Medium | High | High | MFA, Session Management |
| SQL Injection | Low | High | Medium | Parameterized Queries |
| XSS Attacks | Low | Medium | Low | Input Sanitization |
| DDoS Attack | Medium | Medium | Medium | Rate Limiting, CDN |

## 🔐 Authentication & Authorization

### Current Implementation (Mock)
```typescript
// WARNING: Current mock implementation
// TODO: Replace with Supabase Auth + BankID
```

### Target Authentication Architecture
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│  Supabase    │────▶│   BankID     │
│   Browser    │◀────│    Auth      │◀────│   Service    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                           ▼
                   ┌──────────────┐
                   │     MFA      │
                   │   (SMS/App)  │
                   └──────────────┘
```

### Authentication Methods
1. **Primary**: Email/Password with Supabase Auth
2. **Enhanced**: BankID for high-value operations
3. **MFA**: SMS or Authenticator app
4. **Session**: JWT with refresh tokens

### Authorization Model (RBAC)
```typescript
enum Role {
  ADMIN = 'admin',           // Full system access
  MAKLARE = 'maklare',      // Real estate agent
  ASSISTENT = 'assistent',   // Assistant/support
  KUND = 'kund'             // Customer/client
}

// Permission matrix
const permissions = {
  admin: ['*'],
  maklare: [
    'objekt:create', 'objekt:read', 'objekt:update', 'objekt:delete',
    'kontakter:*', 'visningar:*', 'bud:*', 'dokument:*'
  ],
  assistent: [
    'objekt:read', 'objekt:update',
    'kontakter:read', 'visningar:read', 'visningar:update'
  ],
  kund: [
    'objekt:read', 'visningar:register', 'bud:place'
  ]
};
```

### Session Management
```typescript
// Session configuration
const sessionConfig = {
  maxAge: 3600,              // 1 hour
  refreshThreshold: 300,    // 5 minutes before expiry
  absoluteTimeout: 86400,   // 24 hours max
  sameSite: 'strict',
  secure: true,              // HTTPS only
  httpOnly: true            // No JavaScript access
};
```

## 🛡️ Data Protection

### Encryption Standards
| Data State | Method | Standard |
|------------|--------|----------|
| At Rest | AES-256-GCM | Database encryption |
| In Transit | TLS 1.3 | HTTPS everywhere |
| Passwords | bcrypt | Cost factor 12 |
| API Keys | AES-256 | Encrypted storage |
| Backups | AES-256 | Encrypted archives |

### Personal Data Classification
```typescript
enum DataClassification {
  PUBLIC = 'public',           // Marketing content
  INTERNAL = 'internal',       // Business data
  CONFIDENTIAL = 'confidential', // Customer data
  SENSITIVE = 'sensitive'      // PII, financial
}

// Data handling rules
const dataHandling = {
  sensitive: {
    encryption: 'required',
    logging: 'masked',
    retention: '7 years',
    access: 'need-to-know'
  },
  confidential: {
    encryption: 'required',
    logging: 'limited',
    retention: '5 years',
    access: 'role-based'
  }
};
```

### Database Security (Supabase RLS)
```sql
-- Row Level Security policies
ALTER TABLE objekt ENABLE ROW LEVEL SECURITY;

-- Agents can see all properties
CREATE POLICY "Agents can view all properties"
  ON objekt FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'maklare'));

-- Agents can only modify their own properties
CREATE POLICY "Agents can modify own properties"
  ON objekt FOR ALL
  TO authenticated
  USING (skapad_av = auth.uid());

-- Customers can only view public properties
CREATE POLICY "Customers view public properties"
  ON objekt FOR SELECT
  TO authenticated
  USING (
    status = 'tillsalu' AND 
    publicerad = true
  );
```

## 📊 GDPR Compliance

### Lawful Basis for Processing
1. **Consent**: Explicit opt-in for marketing
2. **Contract**: Necessary for service delivery
3. **Legal Obligation**: Tax and regulatory requirements
4. **Legitimate Interest**: Fraud prevention, security

### Data Subject Rights Implementation
```typescript
// GDPR rights endpoints
interface GDPREndpoints {
  // Right to Access (Article 15)
  'GET /api/gdpr/export/:userId': DataExport;
  
  // Right to Rectification (Article 16)
  'PUT /api/gdpr/update/:userId': DataUpdate;
  
  // Right to Erasure (Article 17)
  'DELETE /api/gdpr/delete/:userId': DataDeletion;
  
  // Right to Restriction (Article 18)
  'POST /api/gdpr/restrict/:userId': ProcessingRestriction;
  
  // Right to Portability (Article 20)
  'GET /api/gdpr/portability/:userId': MachineReadableExport;
  
  // Right to Object (Article 21)
  'POST /api/gdpr/object/:userId': ProcessingObjection;
}
```

### Privacy Notice Requirements
```typescript
const privacyNotice = {
  dataController: {
    name: 'Mäklarsystem AB',
    contact: 'dpo@maklarsystem.se',
    address: 'Stockholm, Sweden'
  },
  purposes: [
    'Property management',
    'Customer relationship',
    'Legal compliance'
  ],
  legalBasis: ['consent', 'contract', 'legal'],
  retention: {
    customers: '7 years after last activity',
    properties: '10 years after sale',
    marketing: 'Until consent withdrawn'
  },
  rights: [
    'Access', 'Rectification', 'Erasure',
    'Restriction', 'Portability', 'Object'
  ],
  transfers: {
    withinEU: true,
    outsideEU: false,
    safeguards: 'Standard Contractual Clauses'
  }
};
```

### Consent Management
```typescript
interface ConsentRecord {
  userId: string;
  timestamp: Date;
  ipAddress: string;
  purposes: ConsentPurpose[];
  version: string;
  withdrawn?: Date;
}

enum ConsentPurpose {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  PROFILING = 'profiling',
  THIRD_PARTY = 'third_party'
}

// Consent tracking
const trackConsent = async (consent: ConsentRecord) => {
  await supabase.from('consent_log').insert({
    ...consent,
    hash: generateHash(consent) // Immutable proof
  });
};
```

## 🔧 Security Controls

### Input Validation
```typescript
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Input sanitization
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Schema validation
const objektSchema = z.object({
  adress: z.string().min(1).max(100),
  pris: z.number().positive().max(1000000000),
  email: z.string().email(),
  telefon: z.string().regex(/^(\+46|0)[0-9]{9,10}$/)
});
```

### SQL Injection Prevention
```typescript
// ✅ Safe - Parameterized query
const { data, error } = await supabase
  .from('objekt')
  .select('*')
  .eq('id', userId);

// ❌ Unsafe - String concatenation
const query = `SELECT * FROM objekt WHERE id = '${userId}'`;
```

### XSS Prevention
```typescript
// React automatically escapes content
const SafeComponent = ({ userContent }) => {
  return <div>{userContent}</div>; // Auto-escaped
};

// For HTML content, use sanitization
const HtmlComponent = ({ htmlContent }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(htmlContent)
      }}
    />
  );
};
```

### CSRF Protection
```typescript
// CSRF token generation
import { randomBytes } from 'crypto';

const generateCSRFToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Middleware validation
const validateCSRF = (req: Request) => {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;
  
  if (!token || token !== sessionToken) {
    throw new Error('Invalid CSRF token');
  }
};
```

### Rate Limiting
```typescript
import { RateLimiter } from '@/lib/security/rateLimiter';

const limiter = new RateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  max: 100,                  // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to sensitive endpoints
export const rateLimitedHandler = limiter.wrap(handler);
```

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];
```

## 🐛 Vulnerability Management

### Dependency Scanning
```bash
# Regular dependency audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated

# Update dependencies
npm update
```

### Security Testing Checklist
- [ ] OWASP Top 10 assessment
- [ ] Penetration testing (quarterly)
- [ ] Static code analysis (SAST)
- [ ] Dynamic analysis (DAST)
- [ ] Dependency scanning
- [ ] Security headers validation
- [ ] SSL/TLS configuration check

### Common Vulnerabilities Prevention
| Vulnerability | Prevention |
|--------------|------------|
| SQL Injection | Parameterized queries, ORMs |
| XSS | Input sanitization, CSP |
| CSRF | Tokens, SameSite cookies |
| Session Hijacking | Secure cookies, HTTPS |
| Clickjacking | X-Frame-Options |
| Directory Traversal | Path validation |
| File Upload | Type validation, sandboxing |

## 🚨 Incident Response

### Incident Response Plan
```yaml
1. Detection:
   - Automated monitoring alerts
   - User reports
   - Security tool notifications

2. Containment:
   - Isolate affected systems
   - Preserve evidence
   - Stop data exfiltration

3. Investigation:
   - Root cause analysis
   - Impact assessment
   - Timeline reconstruction

4. Remediation:
   - Patch vulnerabilities
   - Reset credentials
   - Update security controls

5. Recovery:
   - Restore services
   - Verify integrity
   - Monitor for recurrence

6. Lessons Learned:
   - Post-incident review
   - Update procedures
   - Staff training
```

### Breach Notification (GDPR)
```typescript
const breachNotification = {
  authorities: {
    deadline: '72 hours',
    contact: 'Datainspektionen',
    required: riskToRights === 'high'
  },
  individuals: {
    deadline: 'Without undue delay',
    required: highRiskToRights === true,
    method: ['email', 'website', 'media']
  },
  documentation: {
    facts: 'Nature and extent of breach',
    impact: 'Likely consequences',
    measures: 'Mitigation steps taken',
    timeline: 'Detection to resolution'
  }
};
```

## ✅ Compliance Checklist

### Pre-Launch Security Checklist
- [ ] **Authentication**
  - [ ] Supabase Auth implemented
  - [ ] Session management configured
  - [ ] Password policy enforced
  - [ ] Account lockout mechanism

- [ ] **Authorization**
  - [ ] RBAC implemented
  - [ ] RLS policies configured
  - [ ] API permissions validated
  - [ ] Admin access restricted

- [ ] **Data Protection**
  - [ ] Encryption at rest enabled
  - [ ] TLS 1.3 configured
  - [ ] Sensitive data masked in logs
  - [ ] Backup encryption verified

- [ ] **GDPR Compliance**
  - [ ] Privacy policy published
  - [ ] Consent management system
  - [ ] Data export functionality
  - [ ] Deletion procedures tested

- [ ] **Security Controls**
  - [ ] Input validation implemented
  - [ ] CSRF protection active
  - [ ] Rate limiting configured
  - [ ] Security headers set

- [ ] **Monitoring**
  - [ ] Audit logging enabled
  - [ ] Alerting configured
  - [ ] Incident response tested
  - [ ] Backup recovery verified

### BankID Integration Requirements
```typescript
const bankIdRequirements = {
  certificate: 'Production certificate required',
  testing: 'Use test environment first',
  compliance: {
    authentication: 'Two-factor by default',
    signing: 'Legal e-signatures',
    storage: 'No PIN storage allowed'
  },
  security: {
    api: 'Client certificate required',
    data: 'End-to-end encryption',
    session: 'Limited validity period'
  }
};
```

## 🏗️ Security Architecture

### Network Security
```
Internet
    │
    ▼
CloudFlare (DDoS, WAF)
    │
    ▼
Vercel Edge (Rate Limiting)
    │
    ▼
Next.js Application
    │
    ├── API Routes (Authentication)
    │
    └── Supabase (RLS, Encryption)
        │
        └── PostgreSQL (Encrypted)
```

### Data Flow Security
```
User Input
    │
    ▼
Client Validation (Zod)
    │
    ▼
HTTPS Transport (TLS 1.3)
    │
    ▼
Server Validation (Zod)
    │
    ▼
Sanitization (DOMPurify)
    │
    ▼
Database (RLS + Encryption)
```

## 📊 Audit & Monitoring

### Audit Log Schema
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  metadata?: Record<string, any>;
}

enum AuditAction {
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  CREATE = 'resource.create',
  READ = 'resource.read',
  UPDATE = 'resource.update',
  DELETE = 'resource.delete',
  EXPORT = 'gdpr.export',
  CONSENT = 'gdpr.consent'
}
```

### Monitoring Metrics
```yaml
Authentication:
  - Failed login attempts
  - Account lockouts
  - Password resets
  - MFA usage

Authorization:
  - Permission denials
  - Privilege escalations
  - Role changes

Data Access:
  - Sensitive data access
  - Bulk exports
  - Cross-tenant access

Security Events:
  - Rate limit violations
  - CSRF failures
  - Input validation errors
  - SQL injection attempts
```

### Alert Thresholds
```typescript
const alertThresholds = {
  failedLogins: {
    threshold: 5,
    window: '5 minutes',
    action: 'Lock account'
  },
  rateLimiting: {
    threshold: 1000,
    window: '1 minute',
    action: 'Block IP'
  },
  dataExport: {
    threshold: 100,
    window: '1 hour',
    action: 'Alert admin'
  }
};
```

## 📞 Security Contacts

### Internal Contacts
- **Security Team**: security@maklarsystem.se
- **Data Protection Officer**: dpo@maklarsystem.se
- **Incident Response**: incident@maklarsystem.se

### External Resources
- **Datainspektionen**: [www.datainspektionen.se](https://www.datainspektionen.se)
- **CERT-SE**: [www.cert.se](https://www.cert.se)
- **BankID Support**: [support.bankid.com](https://support.bankid.com)

### Emergency Procedures
1. **Data Breach**: Immediate containment, 72-hour notification
2. **System Compromise**: Isolate, preserve evidence, restore
3. **DDoS Attack**: Enable DDoS protection, scale resources
4. **Account Takeover**: Lock account, reset credentials, notify user

---

*This security documentation is confidential. Regular reviews and updates are mandatory.*