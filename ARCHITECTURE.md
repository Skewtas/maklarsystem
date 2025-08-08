# 🏗️ Mäklarsystem Architecture Documentation

> Version: 1.0.0  
> Last Updated: 2025-08-06  
> Status: Living Document

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Architecture](#data-architecture)
6. [API Architecture](#api-architecture)
7. [Security Architecture](#security-architecture)
8. [Integration Architecture](#integration-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Performance Considerations](#performance-considerations)

## 🎯 System Overview

### Vision
A modern, scalable Swedish real estate management system that provides comprehensive tools for mäklare (real estate agents) to manage properties, clients, viewings, and transactions.

### Architecture Style
- **Pattern**: Modular Monolith with Service-Oriented Architecture (SOA) principles
- **Frontend**: Single Page Application (SPA) with Server-Side Rendering (SSR)
- **Backend**: RESTful API with real-time WebSocket capabilities
- **Database**: PostgreSQL with real-time subscriptions

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────┬────────────────┬─────────────────────────┤
│   Web Browser   │  Mobile App    │   External Systems      │
│   (Next.js)     │  (React Native)│   (Hemnet, BankID)     │
└────────┬────────┴────────┬───────┴──────────┬─────────────┘
         │                 │                  │
         ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│                  (Next.js API Routes)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Business   │ │   Service    │ │ Integration  │
│    Logic     │ │    Layer     │ │   Services   │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ • Validation │ │ • Auth       │ │ • Hemnet API │
│ • Rules      │ │ • Objekt     │ │ • BankID     │
│ • Workflows  │ │ • Kontakter  │ │ • SMS Gateway│
│              │ │ • Visningar  │ │ • Email      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│                  (Supabase/PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  • Tables: objekt, kontakter, visningar, bud, dokument     │
│  • Row Level Security (RLS)                                 │
│  • Real-time subscriptions                                  │
│  • File storage (images, documents)                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Architecture Principles

### Core Principles
1. **Modularity**: Loosely coupled, highly cohesive modules
2. **Scalability**: Horizontal scaling capability
3. **Security First**: Defense in depth approach
4. **Performance**: Sub-3 second page loads
5. **Maintainability**: Clean code, comprehensive documentation
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Localization**: Swedish-first with i18n support

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Factory Pattern**: Object creation
- **Observer Pattern**: Real-time updates
- **Strategy Pattern**: Validation and pricing rules
- **Facade Pattern**: External API integration

## 💻 Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.4 | Framework with SSR/SSG |
| React | 19.1.0 | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Styling |
| React Hook Form | 7.61.1 | Form Management |
| Zod | 3.25.76 | Schema Validation |
| TanStack Query | 5.83.0 | Data Fetching |
| Framer Motion | 12.x | Animations |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API | 15.4.4 | API Routes |
| Supabase | 2.53.0 | BaaS Platform |
| PostgreSQL | 15.x | Database |
| Node.js | 20.x | Runtime |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Prettier | Code Formatting |
| Jest | Unit Testing |
| Playwright | E2E Testing |
| GitHub Actions | CI/CD |

## 🧩 System Components

### Frontend Components

#### 1. Layout Components
```typescript
components/
├── layout/
│   ├── DashboardLayout.tsx    # Main dashboard wrapper
│   ├── Navigation.tsx          # Top navigation
│   ├── Sidebar.tsx            # Side navigation
│   └── UserMenu.tsx           # User profile menu
```

#### 2. Form Components
```typescript
components/
├── forms/
│   ├── sections/              # Form sections
│   │   ├── GrundinformationSection.tsx
│   │   ├── InteriorSection.tsx
│   │   ├── BeskrivningarSection.tsx
│   │   ├── ByggnadSection.tsx
│   │   └── AvgifterSection.tsx
│   └── fields/                # Reusable fields
│       ├── FormField.tsx
│       ├── FormDatePicker.tsx
│       └── FormRadioGroup.tsx
```

#### 3. UI Components
```typescript
components/
├── ui/
│   ├── glass/                 # Glassmorphism components
│   │   ├── GlassCard.tsx
│   │   ├── GlassInput.tsx
│   │   └── GlassSelect.tsx
│   └── base/                  # Base components
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
```

### Backend Services

#### Core Services
```typescript
lib/
├── api/
│   ├── objekt.ts              # Property management
│   ├── kontakter.ts           # Contact management
│   ├── visningar.ts           # Viewing management
│   ├── bud.ts                 # Bidding system
│   └── dokument.ts            # Document management
```

#### Business Logic
```typescript
lib/
├── validation/
│   ├── schemas/               # Zod schemas
│   ├── validators/            # Custom validators
│   └── messages/              # Validation messages
├── security/
│   ├── rateLimiter.ts        # Rate limiting
│   ├── csrf.ts               # CSRF protection
│   └── sanitizer.ts          # Input sanitization
└── performance/
    ├── cache.ts              # Caching strategy
    └── compression.ts        # Response compression
```

## 🗄️ Data Architecture

### Database Schema

#### Core Tables
```sql
-- Properties table
CREATE TABLE objekt (
  id UUID PRIMARY KEY,
  adress TEXT NOT NULL,
  typ objekt_typ_enum,
  pris DECIMAL(12,2),
  rum INTEGER,
  boarea DECIMAL(8,2),
  tomtarea DECIMAL(10,2),
  byggår INTEGER,
  status objekt_status_enum,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Contacts table
CREATE TABLE kontakter (
  id UUID PRIMARY KEY,
  förnamn TEXT NOT NULL,
  efternamn TEXT NOT NULL,
  email TEXT,
  telefon TEXT,
  typ kontakt_typ_enum,
  gdpr_samtycke BOOLEAN,
  created_at TIMESTAMPTZ
);

-- Viewings table
CREATE TABLE visningar (
  id UUID PRIMARY KEY,
  objekt_id UUID REFERENCES objekt(id),
  datum DATE NOT NULL,
  tid TIME NOT NULL,
  typ visning_typ_enum,
  max_antal INTEGER
);

-- Bids table
CREATE TABLE bud (
  id UUID PRIMARY KEY,
  objekt_id UUID REFERENCES objekt(id),
  kontakt_id UUID REFERENCES kontakter(id),
  belopp DECIMAL(12,2),
  datum TIMESTAMPTZ,
  status bud_status_enum
);
```

### Data Flow
```
User Input → Validation → API Route → Service Layer → Database
     ↑                                                    ↓
     └──────────── Real-time Updates ←───────────────────┘
```

### Caching Strategy
- **Browser Cache**: Static assets (1 year)
- **CDN Cache**: Images and documents (1 month)
- **API Cache**: GET requests (5 minutes)
- **Database Cache**: Query results (1 minute)

## 🔌 API Architecture

### RESTful Endpoints
```
/api/
├── auth/
│   ├── login         POST    # User login
│   ├── logout        POST    # User logout
│   └── refresh       POST    # Refresh token
├── objekt/
│   ├── /             GET     # List properties
│   ├── /             POST    # Create property
│   ├── /:id          GET     # Get property
│   ├── /:id          PUT     # Update property
│   └── /:id          DELETE  # Delete property
├── kontakter/
│   └── ...           # Similar CRUD operations
├── visningar/
│   └── ...           # Similar CRUD operations
└── bud/
    └── ...           # Similar CRUD operations
```

### Real-time Subscriptions
```typescript
// WebSocket channels
channels/
├── objekt/:id/bud      # Bid updates for property
├── visningar/:id       # Viewing registrations
└── notifications       # User notifications
```

### API Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-08-06T10:00:00Z",
    "version": "1.0.0"
  },
  "errors": []
}
```

## 🔒 Security Architecture

### Authentication & Authorization
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│  Supabase    │────▶│   Database   │
│              │◀────│    Auth      │◀────│     RLS      │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             ▼
                    ┌──────────────┐
                    │   BankID     │
                    │ (Future)     │
                    └──────────────┘
```

### Security Layers
1. **Network Security**
   - HTTPS everywhere
   - CORS configuration
   - Rate limiting

2. **Application Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **Data Security**
   - Encryption at rest
   - Encryption in transit
   - PII data masking
   - GDPR compliance

4. **Access Control**
   - Role-based access (RBAC)
   - Row-level security (RLS)
   - API key management

## 🔗 Integration Architecture

### External Systems
```
Mäklarsystem
     │
     ├── Hemnet API          # Property listings
     ├── BankID              # Secure authentication
     ├── SMS Gateway         # Notifications
     ├── Email Service       # Communications
     ├── Payment Gateway     # Transactions
     └── Document Service    # E-signing
```

### Integration Patterns
- **Adapter Pattern**: External API abstraction
- **Circuit Breaker**: Fault tolerance
- **Retry Logic**: Transient failure handling
- **Queue System**: Async processing (future)

## 🚀 Deployment Architecture

### Environment Strategy
```
Development → Staging → Production
    │           │           │
    ├── Local   ├── Test    └── Live
    ├── Mock    ├── Real    └── Real
    └── Debug   └── QA      └── Monitor
```

### Infrastructure
```
┌─────────────────────────────────────┐
│         Vercel (Frontend)           │
│     • Next.js Application          │
│     • Edge Functions               │
│     • CDN                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Supabase (Backend)            │
│     • PostgreSQL Database          │
│     • Authentication               │
│     • Real-time                    │
│     • Storage                      │
└─────────────────────────────────────┘
```

### CI/CD Pipeline
```yaml
1. Code Push → GitHub
2. GitHub Actions → Run Tests
3. Tests Pass → Build Application
4. Build Success → Deploy to Vercel
5. Deploy Success → Health Check
6. Health Check Pass → Live
```

## ⚡ Performance Considerations

### Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | <1.5s | TBD |
| Time to Interactive | <3.5s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |
| First Input Delay | <100ms | TBD |

### Optimization Strategies
1. **Code Splitting**: Dynamic imports for routes
2. **Image Optimization**: Next.js Image component
3. **Bundle Size**: Tree shaking, minification
4. **Caching**: Aggressive caching strategy
5. **Lazy Loading**: Components and images
6. **Database**: Indexes on frequently queried fields
7. **API**: Pagination, field selection

### Monitoring
- **Application Performance Monitoring (APM)**: Vercel Analytics
- **Error Tracking**: Sentry (planned)
- **Uptime Monitoring**: Pingdom (planned)
- **Database Monitoring**: Supabase Dashboard

## 📚 References

### Internal Documentation
- [Project Status](/PROJECT_STATUS.md)
- [MVP Roadmap](/MVP_ROADMAP.md)
- [API Specification](/docs/API_SPECIFICATION.md)
- [Development Guide](/DEVELOPMENT_GUIDE.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

*This architecture document evolves with the system. For questions or updates, contact the development team.*