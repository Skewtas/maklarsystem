# Mäklarsystem - Initial Feature Request

## Project Overview
A modern Swedish real estate management system (Mäklarsystem) built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. The system helps real estate agents (mäklare) manage properties (objekt), contacts (kontakter), showings (visningar), and bids (bud).

## Core Features Needed

### 1. Property Management (Objekthantering)
- Create, edit, and manage property listings (objekt)
- Support for various property types (villa, lägenhet, radhus, fritidshus)
- Rich property details including:
  - Address and fastighetsbeteckning
  - Area measurements (boarea, biarea, tomtarea)
  - Pricing (utgångspris, accepterat pris)
  - Energy classification
  - Property features and amenities
- Image gallery management
- Document attachments (floor plans, energy certificates)
- Property status tracking (Till salu, Såld, Under kontrakt)

### 2. Contact Management (Kontakthantering)
- Manage different contact types:
  - Säljare (sellers)
  - Köpare (buyers)
  - Spekulanter (prospective buyers)
  - Mäklare (agents)
- Contact information with Swedish formats:
  - Personnummer validation
  - Swedish phone numbers
  - Swedish address formats
- Contact history and interactions
- GDPR compliance for data handling

### 3. Showing Management (Visningshantering)
- Schedule and manage property showings
- Track attendance
- Generate showing reports
- Send invitations and reminders
- Collect feedback from attendees

### 4. Bid Management (Budhantering)
- Track incoming bids (bud)
- Bid history and timeline
- Automatic notifications to sellers
- Bid acceptance workflow
- Contract generation support

### 5. Dashboard & Analytics
- Overview of active listings
- Upcoming showings calendar
- Recent bids and activities
- Performance metrics
- Swedish market statistics

## Technical Requirements

### Frontend
- Next.js 15 App Router
- TypeScript with strict typing
- Responsive design with Tailwind CSS
- Glassmorphism UI components
- Swedish localization (dates, numbers, currency)
- Form validation with Zod
- React Hook Form for complex forms

### Backend & Database
- Supabase for authentication and database
- Row Level Security (RLS) policies
- Real-time subscriptions for bids and updates
- Secure file storage for documents and images

### Security & Performance
- CSRF protection
- Rate limiting on API endpoints
- Input sanitization
- Optimized database queries
- Image optimization
- Caching strategies

### Swedish-Specific Requirements
- Personnummer and organisationsnummer validation
- Fastighetsbeteckning format support
- Swedish address and postal code validation
- SEK currency formatting
- Swedish date formats
- GDPR compliance

## Current Implementation Status
- Basic authentication system in place
- Initial database schema created
- Core UI components developed
- Validation schemas implemented
- Basic property listing functionality

## Next Priority Features
1. Complete field grouping and collapsible sections for property forms
2. Implement advanced search and filtering
3. Add real-time bid tracking
4. Create showing calendar integration
5. Build reporting and analytics dashboard

## Success Criteria
- Intuitive UI that Swedish real estate agents can use without training
- Fast performance with sub-3 second page loads
- Mobile-responsive design for field work
- Secure handling of sensitive personal data
- Integration-ready for external services (Hemnet, Booli, etc.)

## Technical Constraints
- Must work with existing Supabase setup
- Maintain compatibility with Next.js 15 App Router
- Follow established code patterns in the project
- Use existing validation and security frameworks
- Preserve Swedish terminology throughout the system