# 👨‍💻 Mäklarsystem Development Guide

> Version: 1.0.0  
> Last Updated: 2025-08-06  
> Audience: Developers, Contributors

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Standards](#code-standards)
4. [Swedish Terminology](#swedish-terminology)
5. [Git Workflow](#git-workflow)
6. [Testing Strategy](#testing-strategy)
7. [Build & Deployment](#build--deployment)
8. [Debugging](#debugging)
9. [Performance Guidelines](#performance-guidelines)
10. [Contributing](#contributing)

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: v2.x or higher
- **PostgreSQL**: v15.x (via Supabase)
- **VS Code**: Recommended IDE

### Initial Setup
```bash
# Clone repository
git clone https://github.com/maklarsystem/maklarsystem.git
cd maklarsystem

# Install dependencies
cd maklarsystem
npm install

# Copy environment variables
cp .env.example .env.local

# Configure environment
# Edit .env.local with your Supabase credentials
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# External Services (Future)
HEMNET_API_KEY=your-hemnet-key
BANKID_CLIENT_ID=your-bankid-id
SMS_GATEWAY_KEY=your-sms-key

# Development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Running the Application
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run tests
npm run test
```

## 💻 Development Environment

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Project Structure
```
maklarsystem/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (dashboard)/     # Dashboard routes
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication routes
│   │   ├── kontakter/      # Contacts pages
│   │   ├── nytt/           # New object form
│   │   └── objekt/         # Properties pages
│   ├── components/         # React components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components
│   ├── lib/                # Utilities and logic
│   │   ├── api/            # API functions
│   │   ├── enums/          # TypeScript enums
│   │   ├── schemas/        # Zod schemas
│   │   ├── security/       # Security utilities
│   │   └── validation/     # Validators
│   ├── types/              # TypeScript types
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── docs/                   # Documentation
└── .taskmaster/           # Task management
```

## 📝 Code Standards

### TypeScript Guidelines
```typescript
// ✅ Good - Explicit types
interface ObjektData {
  id: string;
  adress: string;
  pris: number;
  rum: number;
  boarea: number;
}

// ❌ Bad - Using 'any'
const data: any = fetchData();

// ✅ Good - Type-safe function
function calculateProvision(pris: number): number {
  return pris * 0.025;
}

// ✅ Good - Enum for constants
enum ObjektStatus {
  TILLSALU = 'tillsalu',
  SALD = 'sald',
  KOMMANDE = 'kommande'
}
```

### React Component Standards
```typescript
// ✅ Good - Typed functional component
interface ObjektCardProps {
  objekt: ObjektData;
  onVisningClick?: (id: string) => void;
}

export const ObjektCard: React.FC<ObjektCardProps> = ({ 
  objekt, 
  onVisningClick 
}) => {
  return (
    <div className="rounded-lg p-4">
      <h3>{objekt.adress}</h3>
      <p>{formatCurrency(objekt.pris)}</p>
    </div>
  );
};

// ✅ Good - Custom hooks
function useObjekt(id: string) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['objekt', id],
    queryFn: () => fetchObjekt(id)
  });
  
  return { objekt: data, error, isLoading };
}
```

### Tailwind CSS Conventions
```tsx
// ✅ Good - Organized classes
<div className="
  /* Layout */
  flex flex-col gap-4
  /* Spacing */
  p-6 mx-auto
  /* Styling */
  bg-white rounded-lg shadow-md
  /* Responsive */
  md:flex-row md:gap-6
  /* States */
  hover:shadow-lg transition-shadow
">

// ✅ Good - Component variants with clsx
import clsx from 'clsx';

const buttonClasses = clsx(
  'px-4 py-2 rounded-lg font-medium',
  {
    'bg-blue-500 text-white': variant === 'primary',
    'bg-gray-200 text-gray-800': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled
  }
);
```

### File Naming Conventions
```
components/
├── ObjektCard.tsx          # PascalCase for components
├── useObjekt.ts           # camelCase with 'use' prefix for hooks
├── objektHelpers.ts       # camelCase for utilities
└── objekt.types.ts        # camelCase with '.types' for types
```

## 🇸🇪 Swedish Terminology

### Domain Dictionary
```typescript
// Swedish → English mapping for code
const TERMINOLOGY = {
  // Properties
  objekt: 'property',
  adress: 'address',
  pris: 'price',
  rum: 'rooms',
  boarea: 'livingArea',
  tomtarea: 'plotArea',
  byggar: 'yearBuilt',
  
  // Contacts
  kontakter: 'contacts',
  saljare: 'seller',
  kopare: 'buyer',
  spekulant: 'prospect',
  
  // Viewings
  visning: 'viewing',
  anmalan: 'registration',
  
  // Bidding
  bud: 'bid',
  budgivare: 'bidder',
  
  // Status
  tillsalu: 'forSale',
  sald: 'sold',
  kommande: 'upcoming'
};
```

### UI Text Guidelines
```typescript
// Keep Swedish in UI, English in code
const labels = {
  // Swedish for display
  display: {
    title: 'Nytt objekt',
    save: 'Spara',
    cancel: 'Avbryt'
  },
  
  // English for internal use
  internal: {
    formId: 'new-property-form',
    submitAction: 'saveProperty'
  }
};
```

## 🔀 Git Workflow

### Branch Strategy
```bash
main
├── develop
│   ├── feature/viewing-management
│   ├── feature/bidding-system
│   └── feature/document-templates
├── hotfix/critical-bug
└── release/v1.0.0
```

### Branch Naming
- **Feature**: `feature/description-in-english`
- **Bugfix**: `bugfix/issue-number-description`
- **Hotfix**: `hotfix/critical-issue`
- **Release**: `release/v1.0.0`

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat(objekt): add viewing scheduling functionality
fix(auth): resolve login redirect issue
docs(api): update endpoint documentation
style(ui): improve mobile responsiveness
refactor(validation): simplify zod schemas
test(kontakter): add unit tests for contact service
chore(deps): update dependencies
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log statements
```

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

### Unit Testing
```typescript
// objektHelpers.test.ts
import { calculateProvision } from '@/lib/objektHelpers';

describe('calculateProvision', () => {
  it('should calculate 2.5% provision', () => {
    expect(calculateProvision(1000000)).toBe(25000);
  });
  
  it('should handle zero price', () => {
    expect(calculateProvision(0)).toBe(0);
  });
});
```

### Integration Testing
```typescript
// api/objekt.test.ts
describe('POST /api/objekt', () => {
  it('should create new property', async () => {
    const response = await fetch('/api/objekt', {
      method: 'POST',
      body: JSON.stringify(mockObjekt)
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### E2E Testing with Playwright
```typescript
// objekt-creation.spec.ts
test('should create new property listing', async ({ page }) => {
  await page.goto('/nytt');
  await page.fill('[name="adress"]', 'Testgatan 1');
  await page.fill('[name="pris"]', '3500000');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/objekt\/[\w-]+/);
});
```

## 🏗️ Build & Deployment

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Analyze bundle size
npm run analyze

# Type checking
npm run type-check
```

### Deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build successful locally
- [ ] Performance budget met
- [ ] Security headers configured

### CI/CD Pipeline (GitHub Actions)
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 🔍 Debugging

### Debug Configuration
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Common Issues & Solutions

#### Issue: Supabase connection fails
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npx supabase status
```

#### Issue: TypeScript errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

#### Issue: Tailwind classes not working
```bash
# Restart dev server
npm run dev

# Check Tailwind config
npx tailwindcss --help
```

## ⚡ Performance Guidelines

### Image Optimization
```tsx
import Image from 'next/image';

// ✅ Good - Optimized image
<Image
  src="/objekt/huvudbild.jpg"
  alt="Property exterior"
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
/>
```

### Code Splitting
```typescript
// ✅ Good - Dynamic imports
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);
```

### Data Fetching
```typescript
// ✅ Good - Parallel data fetching
const [objektData, kontakterData] = await Promise.all([
  fetchObjekt(id),
  fetchKontakter()
]);
```

### Memoization
```typescript
// ✅ Good - Memoized expensive calculations
const expensiveValue = useMemo(
  () => calculateComplexValue(data),
  [data]
);
```

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create feature branch
3. Make changes
4. Write/update tests
5. Update documentation
6. Submit pull request

### Code Review Process
1. **Self-review**: Check your own code first
2. **Automated checks**: CI/CD must pass
3. **Peer review**: At least one approval required
4. **Merge**: Squash and merge to main branch

### Communication
- **Slack**: #maklarsystem-dev
- **Issues**: GitHub Issues for bugs/features
- **Discussions**: GitHub Discussions for questions
- **Email**: dev@maklarsystem.se

## 📚 Resources

### Internal Documentation
- [Project Status](/PROJECT_STATUS.md)
- [Architecture](/ARCHITECTURE.md)
- [API Specification](/docs/API_SPECIFICATION.md)
- [Security Guidelines](/SECURITY.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Learning Resources
- [Swedish Real Estate Terms](https://www.maklarsamfundet.se/ordlista)
- [GDPR for Developers](https://gdpr.eu/developers)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref)

---

*Happy coding! 🚀 För frågor, kontakta utvecklingsteamet.*