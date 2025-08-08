# PHASE 1: MVP PRODUCT REQUIREMENTS

## Overview

Phase 1 focuses on creating a Minimum Viable Product (MVP) that demonstrates core functionality and establishes the technical foundation for the complete system.

**Duration**: 3 months (Months 1-3)
**Target Completion**: 35% feature parity with Vitec Express
**Current Status**: Month 2 in progress

## Sprint Breakdown

### Sprint 1-2: Foundation (Weeks 1-4) ✅ COMPLETE
**Status**: 100% complete

#### Delivered
- Next.js 15.4.4 project setup with App Router
- Supabase integration and schema
- Authentication system (currently disabled due to Next.js 15 compatibility)
- Basic navigation and routing
- Glassmorphism UI design system
- TypeScript configuration

### Sprint 3-4: Core Entities (Weeks 5-8) - CURRENT
**Status**: 40% complete

#### In Progress
- [ ] Property CRUD operations with real data
- [x] Property list view with filters
- [x] Property detail view with tabs
- [ ] Contact CRUD operations
- [x] Contact list view
- [ ] Supabase real-time subscriptions

#### Completed
- Mock data structure
- UI components and layouts
- Filter systems
- Tab navigation

### Sprint 5-6: MVP Features (Weeks 9-12)
**Status**: Not started

#### Planned
- [ ] Basic viewing scheduling
- [ ] Simple document templates
- [ ] User management
- [ ] Basic reporting dashboard
- [ ] Authentication restoration
- [ ] Testing and bug fixes

## Critical Path Items

### 1. Authentication Restoration (BLOCKER)
**Priority**: Critical
**Status**: Blocked by Next.js 15 compatibility

#### Current Issue
- Supabase Auth Helpers incompatible with Next.js 15
- Causes white screen crash
- Temporarily disabled for development

#### Solution Approach
1. Migrate to Next.js 15 compatible auth solution
2. Implement custom auth middleware
3. Restore session management
4. Enable protected routes

### 2. Database Integration
**Priority**: High
**Status**: In Progress

#### Requirements
- Replace all mock data with Supabase queries
- Implement React Query for caching
- Add optimistic updates
- Error handling and retry logic

### 3. Form Implementation
**Priority**: High
**Status**: Planning

#### Property Form Fields (Priority Order)

**Essential Fields (Week 5)**
```typescript
{
  // Basic Information
  objekttyp: 'Villa' | 'Lägenhet' | 'Radhus' | 'Tomt',
  adress: string,
  område: string,
  kommun: string,
  pris: number,
  antal_rum: number,
  boarea: number,
  tomtarea?: number,
  byggnadsår: number,
  
  // Costs
  avgift?: number,
  driftkostnad?: number,
  
  // Status
  status: 'Kommande' | 'Till salu' | 'Under bud' | 'Såld'
}
```

**Important Fields (Week 6)**
```typescript
{
  // Features
  balkong_terrass: boolean,
  hiss: boolean,
  garage: boolean,
  förråd: boolean,
  
  // Technical
  energiklass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
  uppvärmning: string,
  internet: string,
  
  // Location
  kollektivtrafik: string,
  våning?: number
}
```

**Nice-to-Have Fields (If time permits)**
- Additional amenities
- Detailed location information
- Custom fields

## User Stories

### As a Mäklare (Agent)
1. **I want to** create a new property listing **so that** I can advertise it for sale
   - **Acceptance Criteria**:
     - All required fields validated
     - Images uploaded and optimized
     - Saved to database
     - Visible in property list

2. **I want to** schedule viewings **so that** potential buyers can see the property
   - **Acceptance Criteria**:
     - Select date and time
     - Avoid conflicts
     - Send confirmations
     - Track registrations

3. **I want to** manage contacts **so that** I can track potential buyers
   - **Acceptance Criteria**:
     - Add new contacts
     - Categorize by type
     - Link to properties
     - Track interactions

### As a Kontorschef (Manager)
1. **I want to** see dashboard metrics **so that** I can monitor team performance
   - **Acceptance Criteria**:
     - Active listings count
     - Viewing statistics
     - Sales pipeline
     - Agent activity

## Technical Specifications

### API Endpoints (Priority Order)

#### Week 5: Core CRUD
```
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
```

#### Week 6: Features
```
GET    /api/viewings
POST   /api/viewings
PUT    /api/viewings/:id

GET    /api/dashboard/stats
```

### Database Schema Updates

#### Required Tables (Already Created)
- `properties` ✅
- `contacts` ✅
- `viewings` ✅
- `users` ✅

#### Required Relationships
```sql
-- Property -> Agent
properties.agent_id -> users.id

-- Viewing -> Property
viewings.property_id -> properties.id

-- Contact -> Properties (many-to-many)
contact_property_interests
```

## Definition of Done

### Sprint 3-4 Completion Criteria
- [ ] All mock data replaced with real database queries
- [ ] Forms working with validation
- [ ] CRUD operations for properties and contacts
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Basic tests written

### Phase 1 MVP Criteria
- [ ] Authentication working
- [ ] Core entities manageable
- [ ] Basic viewing system functional
- [ ] Dashboard showing real metrics
- [ ] System deployable to production
- [ ] Documentation complete

## Risk Mitigation

### High Priority Risks
1. **Auth Compatibility**: Research alternative auth solutions now
2. **Data Migration**: Create migration scripts early
3. **Performance**: Implement caching from start
4. **Form Complexity**: Start with essential fields only

## Next Steps (Week 5 Priorities)

1. **Monday-Tuesday**: Restore authentication
2. **Wednesday-Thursday**: Implement property CRUD
3. **Friday**: Contact management basics
4. **Weekend**: Testing and fixes

## Success Metrics

### Week 5 Goals
- 5+ real properties in database
- Property create/edit forms working
- Authentication restored
- 0 console errors

### Phase 1 Goals
- 35% feature parity achieved
- < 3 second page loads
- 80% code coverage
- Ready for user testing

---

*This PRD is actively updated as development progresses. Check git history for changes.*