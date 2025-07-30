# Mäklarsystem - Professional Real Estate Management System

## 🚨 KRITISK VARNING: Next.js 15 Kompatibilitet

**VIKTIGT:** Detta system använder för närvarande **AVSTÄNGD AUTENTISERING** på grund av kompatibilitetsproblem mellan Next.js 15 och Supabase Auth Helpers.

### ⚠️ Känt Problem:
- **Next.js 15** ändrade cookies API som krashar Supabase Auth Helpers
- **Symptom:** Vit sida, `cookies().get(...) should be awaited` fel
- **Nuvarande lösning:** All autentisering avstängd tills fix finns

### 📋 Vad som är avstängt:
- ❌ Inloggning/utloggning
- ❌ Rollbaserad åtkomstkontroll  
- ❌ Session hantering
- ❌ Middleware autentisering

### 🔧 För utvecklare:
Se `NEXT_JS_15_AUTH_FIX.md` för fullständig dokumentation av problemet och lösningen.

**ANVÄND ALDRIG:**
- `createServerComponentClient`
- `createMiddlewareClient`
- `cookies().get()` i server components

---

A modern, standalone real estate management system built with Next.js, React, TypeScript, and Supabase. This system is inspired by professional real estate CRM solutions and provides comprehensive tools for real estate agents to manage properties, contacts, and business operations.

## 🚀 Features

### Core Functionality
- **Dashboard** with multiple views (General, Seller Journey, Buyer Journey, Agent Support)
- **Property Management** - Complete CRUD operations for real estate listings
- **Contact Management** - Manage sellers, buyers, prospects, and other contacts
- **Calendar & Tasks** - Schedule viewings, meetings, and track tasks
- **CRM Features** - Lead management, customer meetings, follow-ups
- **Business Intelligence** - Key metrics and reporting
- **Real-time Updates** - Notifications and live data synchronization

### Technical Features
- **Modern UI** - Clean, responsive design matching professional standards
- **Type Safety** - Full TypeScript implementation
- **Real-time Database** - Supabase for data persistence and real-time features
- **Authentication** - Role-based access control (Admin, Agent, Coordinator, Assistant)
- **File Storage** - Document and image management via Supabase Storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React hooks and context

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

## 🔧 Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd maklarsystem
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. Set up Supabase:
- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
- Configure authentication settings
- Enable Row Level Security policies as needed

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
maklarsystem/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── layout/      # Layout components (Navigation, Sidebar)
│   │   └── dashboard/   # Dashboard-specific components
│   ├── lib/             # Utilities and Supabase client
│   └── types/           # TypeScript type definitions
├── supabase/            # Database schema and migrations
└── public/              # Static assets
```

## 🗄️ Database Schema

The system uses the following main tables:
- `users` - System users (agents, coordinators, etc.)
- `objekt` - Real estate properties
- `kontakter` - Contacts (sellers, buyers, prospects)
- `visningar` - Property viewings
- `bud` - Bids on properties
- `kalenderhändelser` - Calendar events
- `uppgifter` - Tasks and to-dos
- `notifikationer` - System notifications

## 🎨 UI Components

### Layout
- **Navigation Bar** - Top navigation with hamburger menu, notifications, and search
- **Sidebar** - Main navigation menu with collapsible design
- **Dashboard Layout** - Wrapper component for consistent page structure

### Dashboard Widgets
- Recent Objects/Contacts
- Property Status Overview
- CRM Statistics
- Opportunity Funnel
- Calendar Preview
- Task List
- Key Metrics

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication via Supabase Auth
- API keys stored in environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Self-hosted with Node.js

## 🛣️ Roadmap

### Phase 1 - Core Features ✅
- [x] Basic dashboard with widgets
- [x] Property listing and management
- [x] Contact management
- [x] Navigation and layout

### Phase 2 - Enhanced Features (Coming Soon)
- [ ] Full CRUD operations for all entities
- [ ] Advanced filtering and search
- [ ] Document management
- [ ] Email/SMS integration
- [ ] Calendar integration
- [ ] Reporting and analytics

### Phase 3 - Advanced Features
- [ ] Mobile app
- [ ] API for external integrations
- [ ] Advanced automation
- [ ] AI-powered insights

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by professional real estate management systems
- Built with modern web technologies
- Designed for Swedish real estate market needs

---

For questions or support, please open an issue in the repository.
