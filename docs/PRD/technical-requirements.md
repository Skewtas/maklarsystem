# TECHNICAL REQUIREMENTS & ARCHITECTURE

## Technology Stack

### Frontend
```yaml
Framework: Next.js 15.4.4
- App Router architecture
- Server Components
- API Routes
- Middleware

UI Library: React 19.1.0
- Hooks-based architecture
- Concurrent features
- Suspense boundaries

Language: TypeScript 5.x
- Strict mode enabled
- Path aliases configured
- Type-safe API calls

Styling: Tailwind CSS 3.4.1
- Custom theme configuration
- Glassmorphism design system
- Responsive breakpoints
- Dark mode support (future)

Form Management: React Hook Form 7.61.1
- Zod validation (3.25.76)
- Custom error messages
- Field arrays support
- Conditional fields
```

### Backend
```yaml
Database: Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time subscriptions
- Database functions
- Triggers and webhooks

Authentication: Supabase Auth
- Email/password
- Magic links
- OAuth providers (future)
- Session management

Storage: Supabase Storage
- Image optimization
- CDN delivery
- Access control
- Resumable uploads

Real-time: Supabase Realtime
- WebSocket connections
- Presence tracking
- Broadcast messages
- Database changes
```

### Infrastructure
```yaml
Hosting: Vercel
- Edge Functions
- Image Optimization
- Analytics
- Preview deployments

Monitoring: Vercel Analytics
- Web Vitals
- Custom events
- Error tracking
- Performance metrics

CI/CD: GitHub Actions
- Automated testing
- Type checking
- Linting
- Deploy on merge
```

## Architecture Patterns

### Frontend Architecture
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth group routes
│   ├── (dashboard)/    # Protected routes
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── forms/         # Form components
│   └── layout/        # Layout components
├── lib/               # Utilities
│   ├── api/          # API clients
│   ├── db/           # Database types
│   └── utils/        # Helper functions
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
└── types/            # TypeScript types
```

### API Design
```typescript
// RESTful conventions
GET    /api/[resource]          // List
POST   /api/[resource]          // Create
GET    /api/[resource]/[id]     // Read
PUT    /api/[resource]/[id]     // Update
DELETE /api/[resource]/[id]     // Delete

// Pagination
GET /api/[resource]?page=1&limit=20

// Filtering
GET /api/[resource]?status=active&type=villa

// Sorting
GET /api/[resource]?sort=created_at&order=desc

// Relationships
GET /api/[resource]/[id]?include=relations
```

### Database Schema

```sql
-- Core Tables
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  status property_status NOT NULL,
  property_type property_type NOT NULL,
  address JSONB NOT NULL,
  features JSONB,
  agent_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  contact_type contact_type NOT NULL,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  max_attendees INT DEFAULT 20,
  registrations JSONB[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE property_status AS ENUM (
  'draft', 'upcoming', 'for_sale', 'under_offer', 'sold', 'archived'
);

CREATE TYPE property_type AS ENUM (
  'villa', 'apartment', 'townhouse', 'land', 'commercial'
);

CREATE TYPE contact_type AS ENUM (
  'seller', 'buyer', 'prospect', 'partner'
);

-- Indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_viewings_property ON viewings(property_id);
CREATE INDEX idx_viewings_scheduled ON viewings(scheduled_at);
```

## Security Requirements

### Authentication & Authorization
```typescript
// Middleware protection
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session) {
    return NextResponse.redirect('/login');
  }
  
  // Role-based access
  const userRole = session.user.role;
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect('/unauthorized');
  }
}
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Agents can only see their own properties
CREATE POLICY agent_properties ON properties
  FOR ALL
  USING (auth.uid() = agent_id OR 
         EXISTS (
           SELECT 1 FROM users 
           WHERE id = auth.uid() 
           AND role IN ('admin', 'manager')
         ));

-- Contacts visible to all authenticated users
CREATE POLICY view_contacts ON contacts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Data Protection
- GDPR compliance for EU residents
- Personal data encryption at rest
- Secure data transmission (HTTPS only)
- Regular security audits
- Data retention policies
- Right to be forgotten implementation

## Performance Requirements

### Core Web Vitals
```yaml
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### API Performance
```yaml
Response Times:
  - List endpoints: < 200ms
  - Single resource: < 100ms
  - Create/Update: < 300ms
  - Search: < 500ms

Rate Limiting:
  - Anonymous: 100 req/hour
  - Authenticated: 1000 req/hour
  - Premium: 10000 req/hour
```

### Database Optimization
```sql
-- Materialized views for dashboards
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'for_sale') as active_listings,
  COUNT(*) FILTER (WHERE status = 'sold' AND updated_at > NOW() - INTERVAL '30 days') as recent_sales,
  AVG(EXTRACT(epoch FROM (updated_at - created_at))/86400) 
    FILTER (WHERE status = 'sold') as avg_days_to_sell
FROM properties;

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;
```

## Testing Requirements

### Test Coverage Goals
```yaml
Unit Tests: > 80%
Integration Tests: > 60%
E2E Tests: Critical paths only
```

### Testing Stack
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "playwright": "^1.40.0",
    "vitest": "^1.0.0"
  }
}
```

### Test Examples
```typescript
// Unit Test
describe('PropertyForm', () => {
  it('validates required fields', async () => {
    const { getByRole } = render(<PropertyForm />);
    const submitButton = getByRole('button', { name: /submit/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
});

// Integration Test
describe('Property API', () => {
  it('creates a new property', async () => {
    const property = await createProperty({
      title: 'Test Villa',
      price: 5000000,
      status: 'for_sale'
    });
    
    expect(property.id).toBeDefined();
    expect(property.status).toBe('for_sale');
  });
});
```

## Development Standards

### Code Style
```typescript
// ESLint configuration
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Git Workflow
```bash
# Branch naming
feature/[task-id]-description
bugfix/[issue-id]-description
hotfix/critical-issue

# Commit messages
feat: Add property image upload
fix: Resolve contact form validation
docs: Update API documentation
refactor: Simplify auth middleware
test: Add viewing schedule tests
```

### Documentation Requirements
- JSDoc for all public functions
- README for each module
- API documentation (OpenAPI/Swagger)
- Architecture Decision Records (ADRs)
- Deployment guides

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging
logger.info('Property created', {
  propertyId: property.id,
  agentId: session.userId,
  timestamp: new Date().toISOString(),
  metadata: {
    type: property.property_type,
    price: property.price
  }
});
```

### Error Tracking
- Sentry integration for production
- Source maps for debugging
- User context attachment
- Performance monitoring
- Custom error boundaries

### Analytics Events
```typescript
// Track user actions
track('property_viewed', {
  propertyId: id,
  userId: session?.userId,
  source: 'list' | 'search' | 'direct',
  timestamp: Date.now()
});
```

## Deployment Strategy

### Environments
```yaml
Development:
  URL: http://localhost:3000
  Database: Supabase (development project)
  Features: All enabled, debug mode

Staging:
  URL: https://staging.maklarsystem.se
  Database: Supabase (staging project)
  Features: Production-like, test data

Production:
  URL: https://maklarsystem.se
  Database: Supabase (production project)
  Features: Stable features only
```

### CI/CD Pipeline
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

*This document defines the technical standards and requirements for the Mäklarsystem project.*