what# Product Requirements Prompt: Comprehensive Mäklarsystem Implementation

## 🎯 Mission Statement
Build a production-ready Swedish real estate management system that streamlines property listings, contact management, showings, and bid tracking for real estate agents (mäklare) in Sweden.

## 📋 Context & Background

### System Overview
You are implementing a comprehensive real estate management system specifically designed for the Swedish market. The system must handle the complete workflow of Swedish real estate transactions, from initial property listing through final sale, with strict adherence to Swedish business practices, legal requirements, and data formats.

### Current State
- **Existing Infrastructure**: Next.js 15 App Router, Supabase backend, TypeScript, Tailwind CSS
- **Completed**: Basic authentication, initial database schema, core UI components, validation schemas
- **In Progress**: Field grouping and collapsible sections for property forms
- **Architecture**: Component-based with glassmorphism UI, React Hook Form + Zod validation

### Technical Stack
```typescript
// Core Dependencies
{
  "frontend": "Next.js 15 (App Router)",
  "backend": "Supabase (PostgreSQL + Auth + Storage)",
  "language": "TypeScript (strict mode)",
  "styling": "Tailwind CSS + Radix UI",
  "forms": "React Hook Form + Zod",
  "state": "React Query (TanStack Query)",
  "testing": "Jest + Playwright"
}
```

## 🏗️ Implementation Requirements

### Phase 1: Core Property Management System

#### 1.1 Property (Objekt) Module
```typescript
interface Objekt {
  // Identification
  id: string;
  fastighetsbeteckning: string; // e.g., "Kungsholmen 1:23"
  
  // Basic Information
  objektTyp: 'villa' | 'lagenhet' | 'radhus' | 'fritidshus' | 'tomt';
  status: 'till_salu' | 'under_kontrakt' | 'sald' | 'vilande';
  
  // Address
  adress: {
    gatuadress: string;
    postnummer: string; // XXX XX format
    ort: string;
    lan?: string;
    kommun?: string;
  };
  
  // Measurements
  boarea?: number; // m²
  biarea?: number; // m²
  tomtarea?: number; // m²
  rum: number;
  sovrum?: number;
  badrum?: number;
  
  // Pricing
  utgangspris: number; // SEK
  accepteratPris?: number; // SEK
  manadsavgift?: number; // SEK (for apartments)
  driftskostnad?: number; // SEK/year
  
  // Building Details
  byggnadsår?: number;
  renoveratAr?: number;
  energiklass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  uppvarmning?: string;
  vatten?: string;
  avlopp?: string;
  
  // Descriptions
  kortBeskrivning: string; // Max 200 chars
  beskrivning: string; // Rich text
  omradesbeskrivning?: string;
  
  // Relations
  maklareId: string;
  saljareId: string;
  kopareId?: string;
  
  // Metadata
  skapad: Date;
  uppdaterad: Date;
  publicerad?: Date;
  sald?: Date;
  tilltradesdag?: Date;
}
```

**Implementation Requirements:**
- Create comprehensive CRUD operations with Supabase RLS
- Implement image upload with optimization (max 10 images, 5MB each)
- Document management (PDF floor plans, energy certificates)
- Search and filtering with Swedish text support
- Status workflow with validation rules
- Automatic slug generation from address

#### 1.2 Contact (Kontakter) Module
```typescript
interface Kontakt {
  id: string;
  typ: 'saljare' | 'kopare' | 'spekulant' | 'maklare';
  
  // Personal Information
  fornamn: string;
  efternamn: string;
  personnummer?: string; // Validated Swedish format
  organisationsnummer?: string; // For companies
  
  // Contact Details
  telefon: string; // Swedish format validation
  mobil?: string;
  email: string;
  
  // Address
  adress: AdressType;
  
  // Preferences
  kontaktpreferens: 'telefon' | 'email' | 'sms';
  nyhetsbrev: boolean;
  
  // GDPR
  samtycke: {
    marknadsföring: boolean;
    datalagrning: boolean;
    datum: Date;
  };
  
  // Relations
  objekt: string[]; // Related property IDs
  visningar: string[]; // Attended showings
  bud: string[]; // Placed bids
  
  // Activity
  senastKontakt?: Date;
  anteckningar?: string;
  historik: KontaktHistorik[];
}
```

**Implementation Requirements:**
- Swedish format validation (personnummer, phone, postal)
- GDPR compliance with consent tracking
- Contact deduplication logic
- Activity timeline with automatic logging
- Export functionality for GDPR requests
- Integration with email/SMS services

### Phase 2: Transaction Management

#### 2.1 Showing (Visning) Module
```typescript
interface Visning {
  id: string;
  objektId: string;
  
  // Schedule
  datum: Date;
  starttid: string; // HH:MM
  sluttid: string; // HH:MM
  typ: 'oppen' | 'privat' | 'digital';
  
  // Registration
  anmalda: Anmalan[];
  narvaro: Narvaro[];
  maxAntal?: number;
  
  // Details
  beskrivning?: string;
  instruktioner?: string;
  motesplats?: string; // If different from property
  
  // Responsible
  ansvarigMaklare: string;
  vardar?: string[]; // Additional hosts
  
  // Status
  status: 'planerad' | 'pagaende' | 'avslutad' | 'installad';
  
  // Feedback
  feedback: VisningsFeedback[];
}
```

**Implementation Requirements:**
- Calendar integration with iCal export
- Automated reminder system (email/SMS)
- QR code check-in system
- Feedback collection portal
- Waiting list management
- COVID-19 capacity restrictions

#### 2.2 Bid (Bud) Module
```typescript
interface Bud {
  id: string;
  objektId: string;
  
  // Bidder
  budgivareId: string; // Kontakt ID
  
  // Bid Details
  belopp: number; // SEK
  villkor?: string[]; // Conditions
  finansiering: {
    lanelofteBank?: string;
    lanelofteBelopp?: number;
    kontantinsats?: number;
    bekraftat: boolean;
  };
  
  // Timeline
  tidpunkt: Date;
  giltigTill?: Date;
  
  // Status
  status: 'aktivt' | 'accepterat' | 'avslaget' | 'aterdraget' | 'utgatt';
  
  // Contract
  tilltradesdag?: Date;
  kontraktsDatum?: Date;
  
  // Metadata
  ip?: string; // For legal tracking
  signatur?: string; // Digital signature
}
```

**Implementation Requirements:**
- Real-time bid updates with WebSocket
- Bid validation rules (minimum increments)
- Automatic notification system
- Bid history with audit trail
- Legal compliance tracking
- Integration with bank loan verification

### Phase 3: Dashboard & Analytics

#### 3.1 Agent Dashboard
```typescript
interface MaklareDashboard {
  // Overview Cards
  aktiva: {
    objekt: number;
    visningar: number;
    budgivningar: number;
  };
  
  // This Week
  dennaVecka: {
    visningar: Visning[];
    tilltraden: Tilltraden[];
    deadlines: Deadline[];
  };
  
  // Performance
  prestanda: {
    forsaljningar: number; // This month
    genomsnittsTid: number; // Days to sell
    genomsnittsPris: number; // vs asking price %
  };
  
  // Recent Activity
  senaste: {
    bud: Bud[];
    kontakter: Kontakt[];
    visningar: VisningsFeedback[];
  };
}
```

**Implementation Requirements:**
- Real-time data updates
- Customizable widgets
- Export to Excel/PDF
- Mobile-optimized views
- Role-based access control
- Performance caching

### Phase 4: Integrations & Advanced Features

#### 4.1 External Integrations
- **Hemnet API**: Automatic property syndication
- **Booli API**: Market data and valuations
- **BankID**: Secure authentication and signing
- **Kivra/Min Myndighetspost**: Digital document delivery
- **SMS Gateway**: Twilio or 46elks for Swedish numbers
- **Email Service**: SendGrid with Swedish templates

#### 4.2 Advanced Features
- **AI Valuation**: ML-based price suggestions
- **Virtual Tours**: 360° image support
- **Document Generation**: Contracts, reports
- **Market Reports**: Automated area analysis
- **Lead Scoring**: Prioritize serious buyers
- **Automated Marketing**: Social media posting

## 🔒 Security & Compliance Requirements

### Data Protection
```typescript
// Row Level Security Policies
CREATE POLICY "Mäklare can view own objects" ON objekt
  FOR SELECT USING (maklare_id = auth.uid());

CREATE POLICY "Contacts require consent" ON kontakter
  FOR SELECT USING (samtycke->>'datalagring' = 'true');

// Encryption
- Personnummer: AES-256 encryption at rest
- Documents: Encrypted storage in Supabase
- API Keys: Environment variables only
```

### GDPR Compliance
- Consent management system
- Right to be forgotten implementation
- Data portability (JSON/CSV export)
- Activity logging for audits
- Cookie consent banner
- Privacy policy integration

### Swedish Legal Requirements
- Fastighetsmäklarlagen compliance
- Penningtvättslagen (AML) checks
- Budgivningslagen transparency
- Consumer protection laws
- Digital signature validity

## 🎨 UI/UX Requirements

### Design System
```scss
// Glassmorphism Components
.glass-card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20;
  @apply rounded-2xl p-6 shadow-2xl;
  @apply hover:bg-white/15 transition-all duration-300;
}

// Swedish Color Palette
$primary-blue: #006AA7; // Swedish flag blue
$primary-yellow: #FECC02; // Swedish flag yellow
$forest-green: #4A5F3E; // Swedish nature
$winter-white: #F8F9FA; // Nordic minimalism
```

### Component Library
- **Forms**: Multi-step with validation
- **Tables**: Sortable, filterable, exportable
- **Cards**: Property cards with image carousel
- **Modals**: Confirmation dialogs in Swedish
- **Notifications**: Toast messages (Sonner)
- **Charts**: Recharts for analytics
- **Maps**: Mapbox with Swedish geocoding

### Responsive Breakpoints
```css
/* Mobile First Design */
sm: 640px  /* Tablet portrait */
md: 768px  /* Tablet landscape */
lg: 1024px /* Desktop */
xl: 1280px /* Wide desktop */
2xl: 1536px /* Ultra-wide */
```

## 🧪 Testing Requirements

### Test Coverage Targets
- Unit Tests: 80% coverage minimum
- Integration Tests: Critical paths
- E2E Tests: User journeys
- Performance: <3s page load
- Accessibility: WCAG 2.1 AA

### Test Scenarios
```typescript
describe('Swedish Format Validation', () => {
  test('validates personnummer correctly', () => {
    expect(validatePersonnummer('19900101-1234')).toBe(true);
    expect(validatePersonnummer('900101-1234')).toBe(true);
    expect(validatePersonnummer('invalid')).toBe(false);
  });
  
  test('formats Swedish currency', () => {
    expect(formatSEK(1250000)).toBe('1 250 000 kr');
  });
  
  test('validates fastighetsbeteckning', () => {
    expect(validateFastighetsbeteckning('Kungsholmen 1:23')).toBe(true);
  });
});
```

## 📊 Performance Requirements

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1
- **TTI** (Time to Interactive): <3.5s

### Optimization Strategies
- Image lazy loading with Next.js Image
- Code splitting by route
- Database query optimization
- Redis caching for frequent queries
- CDN for static assets
- Service Worker for offline support

## 🚀 Deployment & DevOps

### Environment Setup
```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
DATABASE_URL=postgresql://...

# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://maklarsystem.se
SENTRY_DSN=xxx
ANALYTICS_ID=xxx
```

### CI/CD Pipeline
1. **Pre-commit**: Husky + lint-staged
2. **Testing**: GitHub Actions (Jest + Playwright)
3. **Build**: Vercel deployment
4. **Monitoring**: Sentry error tracking
5. **Analytics**: Plausible or Umami

## 📈 Success Metrics

### Business KPIs
- User adoption rate >80% within 3 months
- Average time to list property <10 minutes
- Bid-to-sale conversion >60%
- User satisfaction score >4.5/5

### Technical KPIs
- Uptime >99.9%
- API response time <200ms p95
- Error rate <0.1%
- Test coverage >80%

## 🎯 Implementation Priorities

### MVP (Week 1-2)
1. ✅ Complete property form with collapsible sections
2. Property CRUD operations
3. Basic contact management
4. Simple search/filter

### Phase 1 (Week 3-4)
1. Showing calendar
2. Bid tracking system
3. Email notifications
4. Mobile responsive design

### Phase 2 (Week 5-6)
1. Advanced dashboard
2. Document management
3. External API integrations
4. Performance optimization

### Phase 3 (Week 7-8)
1. Analytics and reporting
2. Bulk operations
3. Advanced security features
4. Production deployment

## 📝 Development Guidelines

### Code Standards
- Follow CLAUDE.md guidelines strictly
- TypeScript strict mode always
- No `any` types allowed
- Swedish terms in code consistently
- Comments in English or Swedish (be consistent)

### Git Workflow
```bash
# Feature branch
git checkout -b feature/objekthantering

# Commit message format
feat: implement property listing with Swedish validation
fix: correct personnummer validation for century
docs: add Swedish terminology guide

# PR title format
[OBJEKT-123] Add property management module
```

### Documentation Requirements
- JSDoc for all public functions
- README updates for new features
- API documentation with examples
- Swedish user guide
- Video tutorials for agents

## 🔗 Reference Materials

### Internal Documentation
- `/CLAUDE.md` - Project guidelines
- `/examples/` - Code patterns
- `/PRPs/` - Feature specifications

### External Resources
- [Supabase Docs](https://supabase.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Swedish Real Estate Laws](https://www.maklarsamfundet.se)
- [GDPR Guidelines](https://www.imy.se)

## ⚠️ Critical Constraints

### Must Have
- Swedish language UI (no English fallbacks in production)
- Personnummer validation and encryption
- GDPR compliance from day one
- Mobile-responsive design
- Sub-3 second page loads

### Must Not Have
- Storing sensitive data in localStorage
- Client-side validation only
- Hardcoded Swedish text (use i18n)
- Synchronous API calls blocking UI
- Memory leaks in real-time subscriptions

## 🎉 Definition of Done

A feature is complete when:
- [ ] Implementation matches specifications
- [ ] Swedish validation working correctly
- [ ] Unit tests written and passing (>80%)
- [ ] Integration tests for critical paths
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Accessibility checked (WCAG 2.1 AA)
- [ ] Performance benchmarks met (<3s load)
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to staging environment
- [ ] User acceptance testing passed

---

*This PRP serves as the single source of truth for the Mäklarsystem implementation. All development should reference this document for requirements and standards.*