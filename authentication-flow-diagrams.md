# Authentication & Authorization Flow Diagrams

## 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Browser)
    participant M as Middleware
    participant A as Auth Service (Supabase)
    participant D as Database
    participant S as Session Store

    U->>C: Enter credentials
    C->>C: Client-side validation
    C->>A: POST /auth/login
    A->>A: Validate credentials
    A->>D: Check user exists & active
    D-->>A: User data
    A->>A: Hash password comparison
    
    alt Valid credentials
        A->>S: Create session
        A->>A: Generate JWT token
        A-->>C: 200 OK + JWT + Secure cookie
        C->>C: Store token securely
        C-->>U: Redirect to dashboard
    else Invalid credentials
        A-->>C: 401 Unauthorized
        C-->>U: Show error message
    end
```

## 2. Visning Booking Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant M as Auth Middleware
    participant R as RBAC Service
    participant B as Booking API
    participant D as Database
    participant E as Encryption Service

    U->>C: Request booking form
    C->>M: GET /api/visningar/slots
    M->>M: Validate JWT token
    
    alt Valid token
        M->>R: Check permissions
        R->>D: Get user role
        D-->>R: Role data
        R->>R: Evaluate permissions
        
        alt Has permission
            R-->>M: Authorized
            M->>B: Forward request
            B->>D: Get available slots
            D-->>B: Slot data
            B-->>C: 200 OK + slots
            C-->>U: Display booking form
            
            U->>C: Submit booking
            C->>C: Client validation
            C->>M: POST /api/visningar/book
            M->>M: Validate token
            M->>R: Check booking permission
            R-->>M: Authorized
            M->>B: Forward booking data
            B->>B: Server validation
            B->>E: Encrypt PII data
            E-->>B: Encrypted data
            B->>D: Store booking
            D-->>B: Booking ID
            B-->>C: 201 Created
            C-->>U: Booking confirmation
        else No permission
            R-->>M: Forbidden
            M-->>C: 403 Forbidden
            C-->>U: Access denied
        end
    else Invalid token
        M-->>C: 401 Unauthorized
        C-->>U: Redirect to login
    end
```

## 3. OAuth2 Flow (Google Login)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as App Server
    participant G as Google OAuth
    participant S as Supabase Auth
    participant D as Database

    U->>C: Click "Login with Google"
    C->>A: GET /auth/google
    A->>G: Redirect to Google Auth
    G-->>U: Google login page
    U->>G: Enter Google credentials
    G->>G: Validate credentials
    
    alt Valid Google account
        G-->>A: Redirect with auth code
        A->>G: Exchange code for token
        G-->>A: Access token + user info
        A->>S: Create/update user
        S->>D: Store user data
        D-->>S: User record
        S->>S: Generate session
        S-->>A: Session token
        A-->>C: Set secure cookie
        C-->>U: Redirect to dashboard
    else Invalid/Cancelled
        G-->>A: Error callback
        A-->>C: Redirect to login
        C-->>U: Show error
    end
```

## 4. Session Refresh Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant A as Auth Service
    participant S as Session Store

    Note over C,S: Every API request
    
    C->>M: API request + JWT
    M->>M: Check token expiry
    
    alt Token near expiry
        M->>A: Request token refresh
        A->>S: Validate refresh token
        S-->>A: Valid session
        A->>A: Generate new JWT
        A-->>M: New JWT token
        M->>M: Update response headers
        M-->>C: API response + new token
        C->>C: Update stored token
    else Token expired
        M->>A: Validate refresh token
        alt Valid refresh token
            A->>A: Generate new JWT
            A-->>M: New JWT
            M-->>C: 401 + refresh instruction
            C->>C: Use refresh token
            C->>M: Retry with new token
        else Invalid refresh token
            A-->>M: Session expired
            M-->>C: 401 Unauthorized
            C-->>C: Redirect to login
        end
    else Token valid
        M->>M: Continue request
    end
```

## 5. Multi-Factor Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth Service
    participant T as TOTP Service
    participant S as SMS Service
    participant D as Database

    U->>C: Enter username/password
    C->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: User has MFA enabled
    
    A->>A: Generate MFA challenge
    A->>S: Send SMS code
    S-->>U: SMS with code
    A-->>C: 200 + MFA required
    
    C-->>U: Show MFA input
    U->>C: Enter MFA code
    C->>A: POST /auth/mfa/verify
    
    alt Using TOTP
        A->>T: Validate TOTP code
        T-->>A: Valid/Invalid
    else Using SMS
        A->>D: Check SMS code
        D-->>A: Valid/Invalid
    end
    
    alt Valid MFA code
        A->>A: Generate session
        A-->>C: 200 + JWT token
        C-->>U: Access granted
    else Invalid MFA code
        A-->>C: 401 Invalid code
        C-->>U: Show error
        Note over A: Log failed attempt
    end
```

## 6. API Key Authentication Flow (for integrations)

```mermaid
sequenceDiagram
    participant E as External System
    participant G as API Gateway
    participant R as Rate Limiter
    participant A as Auth Service
    participant B as Business Logic
    participant D as Database

    E->>G: API request + API key
    G->>R: Check rate limits
    
    alt Within rate limit
        R-->>G: Proceed
        G->>A: Validate API key
        A->>D: Lookup API key
        D-->>A: Key data + permissions
        
        alt Valid API key
            A->>A: Check key expiry
            A->>A: Check IP whitelist
            A-->>G: Authorized + scope
            G->>B: Forward request
            B->>D: Execute operation
            D-->>B: Result
            B-->>G: Response
            G-->>E: 200 + data
            Note over G: Log API usage
        else Invalid API key
            A-->>G: Unauthorized
            G-->>E: 401 Unauthorized
            Note over G: Log failed attempt
        end
    else Rate limit exceeded
        R-->>G: Too many requests
        G-->>E: 429 Too Many Requests
    end
```

## 7. Booking Verification Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant B as Booking API
    participant E as Email Service
    participant D as Database
    participant Q as Queue Service

    U->>C: Submit booking
    C->>B: POST /bookings
    B->>B: Validate input
    B->>D: Create unverified booking
    D-->>B: Booking ID
    B->>Q: Queue email job
    B-->>C: 201 Created
    C-->>U: Check email message
    
    Q->>E: Process email job
    E->>E: Generate verification link
    E-->>U: Verification email
    
    U->>C: Click verification link
    C->>B: GET /verify?token=xxx
    B->>D: Lookup token
    
    alt Valid token
        D-->>B: Booking found
        B->>B: Check expiry
        alt Not expired
            B->>D: Mark as verified
            D-->>B: Updated
            B-->>C: 200 Verified
            C-->>U: Booking confirmed
        else Expired
            B-->>C: 410 Gone
            C-->>U: Link expired
        end
    else Invalid token
        B-->>C: 404 Not found
        C-->>U: Invalid link
    end
```

## 8. Security Incident Response Flow

```mermaid
flowchart TD
    A[Security Event Detected] --> B{Event Type?}
    
    B -->|Suspicious Login| C[Account Security]
    B -->|Rate Limit Breach| D[DDoS Protection]
    B -->|Data Breach Attempt| E[Critical Response]
    B -->|Failed Auth x5| F[Account Lockout]
    
    C --> C1[Log Event]
    C --> C2[Notify User]
    C --> C3[Require MFA]
    C --> C4[Monitor Account]
    
    D --> D1[Block IP]
    D --> D2[Enable Captcha]
    D --> D3[Alert DevOps]
    D --> D4[Scale Resources]
    
    E --> E1[Isolate System]
    E --> E2[Alert Security Team]
    E --> E3[Preserve Evidence]
    E --> E4[Initiate IR Plan]
    E --> E5[Notify Authorities]
    
    F --> F1[Lock Account]
    F --> F2[Email User]
    F --> F3[Log Attempt]
    F --> F4[Require Reset]
    
    C4 --> G[Resolution]
    D4 --> G
    E5 --> G
    F4 --> G
    
    G --> H[Post-Incident Review]
    H --> I[Update Security Policies]
```

## Security Headers Configuration

```mermaid
graph LR
    A[Client Request] --> B[Next.js Middleware]
    
    B --> C{Route Type}
    
    C -->|API Route| D[API Security Headers]
    C -->|Page Route| E[Page Security Headers]
    C -->|Static Asset| F[Asset Headers]
    
    D --> D1[X-Content-Type-Options: nosniff]
    D --> D2[X-Frame-Options: DENY]
    D --> D3[X-XSS-Protection: 1; mode=block]
    D --> D4[Strict-Transport-Security]
    D --> D5[Content-Security-Policy]
    
    E --> E1[All API Headers +]
    E --> E2[Referrer-Policy]
    E --> E3[Permissions-Policy]
    E --> E4[CSP with nonce]
    
    F --> F1[Cache-Control]
    F --> F2[X-Content-Type-Options]
    
    D --> G[Response]
    E --> G
    F --> G
```

## Implementation Notes

### 1. Token Storage Best Practices
- **Access Token**: Store in memory (not localStorage)
- **Refresh Token**: HttpOnly, Secure, SameSite cookie
- **CSRF Token**: Session storage + header

### 2. Session Security
- Session timeout: 30 minutes of inactivity
- Absolute timeout: 8 hours
- Refresh token rotation on use
- Device fingerprinting for anomaly detection

### 3. Rate Limiting Tiers
```
Public endpoints:     100 req/15 min
Authenticated:        500 req/15 min  
Booking creation:     5 req/hour
Login attempts:       5 req/15 min
API key (basic):      1000 req/hour
API key (premium):    10000 req/hour
```

### 4. Audit Logging Requirements
Every authentication event must log:
- Timestamp (UTC)
- User ID (if available)
- IP address
- User agent
- Event type
- Success/failure
- Failure reason (if applicable)

### 5. GDPR Compliance in Auth
- Explicit consent for data processing
- Right to data portability
- Right to erasure (with audit trail)
- Data minimization in logs
- Encryption at rest for PII

### 6. Security Monitoring Alerts
Trigger alerts for:
- 5+ failed login attempts from same IP
- Successful login from new location
- Privilege escalation attempts
- API key usage from non-whitelisted IP
- Any critical security events