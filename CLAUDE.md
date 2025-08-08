# Mäklarsystem - Project Context & Guidelines

## Project Overview
Swedish real estate management system (Mäklarsystem) for managing properties (objekt), contacts (kontakter), showings (visningar), and bids (bud).

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with glassmorphism styling
- **Testing**: Jest, Playwright
- **Security**: CSRF protection, rate limiting, input sanitization

## 🔄 Project Awareness & Context

### Always Check First
- **Read `CLAUDE.md`** at the start of new conversations to understand project architecture, goals, and constraints
- **Check `TASK.md`** before starting work - if task isn't listed, add it with description and date
- **Review `PLANNING.md`** (if exists) for architectural decisions and long-term goals
- **Use consistent naming conventions** as established in the codebase
- **Follow existing patterns** - check similar files before creating new ones

## Swedish Real Estate Terminology
```typescript
// Core business terms - ALWAYS use Swedish terms in code
Objekt = Property/Listing
Kontakter = Contacts (säljare/köpare/spekulant)
Visning = Showing/Open house
Bud = Bid/Offer
Mäklare = Real estate agent
Uppdrag = Assignment/Mandate
Tillträde = Closing/Move-in date
Fastighetsbeteckning = Property designation
Boarea = Living area
Biarea = Secondary area
Tomtarea = Plot area
Utgångspris = Asking price
Accepterat pris = Accepted price
Såld = Sold
Till salu = For sale
Under kontrakt = Under contract
Spekulant = Prospective buyer
Säljare = Seller
Köpare = Buyer
```

## 🧱 Code Structure & Modularity

### File Organization & Naming
- **Use kebab-case** for files: `objekt-form.tsx`, `kontakt-list.tsx`
- **Never create files > 500 lines** - split into modules when approaching limit
- **Group by feature/responsibility**:
  ```
  components/
    objekt/
      ObjektForm.tsx        # Main component (< 300 lines)
      ObjektForm.hooks.ts   # Custom hooks
      ObjektForm.utils.ts   # Helper functions
      ObjektForm.types.ts   # Type definitions
      ObjektForm.test.tsx   # Component tests
  ```

### Module Organization
- **API Routes**: Keep route handlers focused, extract logic to `/lib`
- **Components**: One component per file, compose smaller components
- **Utilities**: Group related functions in domain-specific files
- **Types**: Centralize in `/types` or colocate with features
- **Maintain Swedish terminology** in types and interfaces

### Import Conventions
- **Prefer absolute imports** from `@/` for cross-module imports
- **Use relative imports** within the same feature/module
- **Group imports**: React → Next.js → External libs → Internal → Types

## 📎 Code Style & Conventions

### TypeScript & React
- **Strict TypeScript** - no `any` types, enable strict mode
- **Functional components** with hooks (no class components)
- **Named exports** for components, utilities
- **Default exports** only for pages/routes
- **Type everything** - Props, State, API responses

### Validation Patterns
```typescript
// Use Zod with Swedish error messages
const personnummerSchema = z.string()
  .regex(/^\d{6}-?\d{4}$/, 'Ogiltigt personnummer format');

// Always validate Swedish-specific formats
const fastighetsbeteckningSchema = z.string()
  .regex(/^[A-ZÅÄÖ][a-zåäö]+\s+\d+:\d+$/, 'Ogiltig fastighetsbeteckning');
```

### Database Conventions
```sql
-- Use snake_case for database fields
-- Keep Swedish terms in column names
CREATE TABLE objekt (
  id UUID PRIMARY KEY,
  fastighetsbeteckning TEXT,
  utgangspris DECIMAL,
  boarea INTEGER,
  objekt_typ TEXT, -- 'villa', 'lagenhet', 'radhus'
  status TEXT -- 'till_salu', 'under_kontrakt', 'sald'
);
```

## Security Requirements

### Always Implement
1. **Input Validation**: Validate all user inputs with Zod schemas
2. **CSRF Protection**: Use CSRF tokens for state-changing operations
3. **Rate Limiting**: Apply rate limits to API endpoints
4. **SQL Injection Prevention**: Use parameterized queries with Supabase
5. **XSS Prevention**: Sanitize HTML content with DOMPurify
6. **Authentication**: Check user session on protected routes
7. **RLS Policies**: Implement Row Level Security in Supabase

### Never Do
- Store sensitive data (personnummer) in plain text
- Trust client-side validation alone
- Expose internal IDs in URLs
- Log sensitive information
- Skip authentication checks
- Use dynamic SQL queries

## Performance Guidelines

### Database Optimization
```typescript
// Use select to limit fields
const { data } = await supabase
  .from('objekt')
  .select('id, adress, utgangspris, boarea')
  .limit(20);

// Create appropriate indexes
CREATE INDEX idx_objekt_status ON objekt(status);
CREATE INDEX idx_kontakter_typ ON kontakter(kontakt_typ);
```

### Image Handling
```typescript
// Always optimize images
import Image from 'next/image';

// Use Supabase storage with transformations
const imageUrl = supabase.storage
  .from('objekt-images')
  .getPublicUrl(filename, {
    transform: {
      width: 800,
      height: 600,
      quality: 75
    }
  });
```

## Component Patterns

### Form Components
```typescript
// Use React Hook Form with Zod
const form = useForm<ObjektFormData>({
  resolver: zodResolver(objektSchema),
  defaultValues: {
    status: 'till_salu',
    // Swedish defaults
  }
});
```

### Glassmorphism UI
```typescript
// Consistent glass effect styling
const glassStyles = cn(
  "backdrop-blur-xl",
  "bg-white/10",
  "border border-white/20",
  "shadow-2xl",
  "rounded-2xl"
);
```

### Async/Error Handling
```typescript
// Always handle loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

try {
  setLoading(true);
  const result = await fetchData();
  // Handle success
} catch (err) {
  setError(err as Error);
  // User-friendly error message in Swedish
  toast.error('Kunde inte hämta data');
} finally {
  setLoading(false);
}
```

## API Patterns

### Endpoint Structure
```typescript
// app/api/objekt/route.ts
export async function GET(request: Request) {
  // 1. Verify authentication
  // 2. Validate query params
  // 3. Apply rate limiting
  // 4. Fetch from Supabase
  // 5. Return formatted response
}
```

### Error Response Format
```typescript
// Consistent error responses
return NextResponse.json(
  { error: 'Objekt hittades inte' },
  { status: 404 }
);
```

## 🧪 Testing & Reliability

### Test Requirements
- **Create tests for all new features** (components, hooks, utilities, API routes)
- **Update existing tests** when modifying logic
- **Test structure mirrors app structure**:
  ```
  src/
    components/objekt/ObjektForm.tsx
  __tests__/
    components/objekt/ObjektForm.test.tsx
  ```

### Test Coverage
Each feature should include:
- ✅ Happy path test (expected use)
- ⚠️ Edge case test (boundary conditions)  
- ❌ Failure case test (error handling)
- 🇸🇪 Swedish format test (personnummer, etc.)

### Testing Tools
- **Jest** for unit tests
- **React Testing Library** for components
- **Playwright** for E2E tests
- **Mock Service Worker (MSW)** for API mocking

## ✅ Task Management

### Task Tracking
- **Update `TASK.md`** (or equivalent) immediately after completing tasks
- **Add discovered tasks** under "Discovered During Work" section
- **Include context** in task descriptions (file paths, dependencies)
- **Date all entries** in format: `YYYY-MM-DD`

### Definition of Done
Task is complete when:
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] TypeScript types defined (no `any`)
- [ ] Swedish validation working
- [ ] Accessibility checked
- [ ] Mobile responsive
- [ ] Error handling implemented

## 📚 Documentation & Explainability

### Code Documentation
```typescript
/**
 * Validates Swedish property designation format
 * 
 * @param beteckning - Property designation (e.g., "Kungsholmen 1:23")
 * @returns True if valid Swedish fastighetsbeteckning
 * 
 * @example
 * validateFastighetsbeteckning("Djursholm 1:234") // true
 */
export function validateFastighetsbeteckning(beteckning: string): boolean {
  // Implementation
}
```

### Component Documentation
```typescript
interface ObjektFormProps {
  /** Initial object data for editing */
  objekt?: Objekt;
  /** Callback fired on successful submission */
  onSubmit: (data: ObjektFormData) => Promise<void>;
  /** Whether form is in read-only mode */
  readonly?: boolean;
}
```

### Documentation Updates
- **Update README.md** when adding features or changing setup
- **Document Swedish-specific logic** with examples
- **Add JSDoc comments** for complex functions
- **Include "Why" comments** for non-obvious decisions:
  ```typescript
  // Reason: Swedish personnummer can be 10 or 12 digits
  // 10: YYMMDD-XXXX (common format)
  // 12: YYYYMMDD-XXXX (century included)
  const pattern = /^\d{6,8}-?\d{4}$/;
  ```

## 🧠 Development Behavior Rules

### Never Do
- **Never assume context** - ask if uncertain about requirements
- **Never use non-existent packages** - verify package exists in package.json
- **Never delete code** without explicit instruction
- **Never skip validation** for Swedish formats
- **Never mix languages** - keep Swedish terms consistent
- **Never trust client input** - always validate
- **Never create files unless absolutely necessary**
- **Never proactively create documentation files** unless explicitly requested

### Always Do
- **Always check existing patterns** before implementing new ones
- **Always validate Swedish formats** (personnummer, postnummer, etc.)
- **Always handle errors gracefully** with Swedish user messages
- **Always test with Swedish characters** (å, ä, ö)
- **Always consider mobile users** (responsive design)
- **Always implement accessibility** (ARIA, keyboard nav)
- **Always prefer editing existing files** to creating new ones
- **Do what has been asked** - nothing more, nothing less

### When Uncertain
- **Check existing codebase** for similar implementations
- **Refer to examples folder** for patterns
- **Ask for clarification** rather than assuming
- **Document assumptions** in comments
- **Create TODO comments** for unclear requirements

## Common Pitfalls to Avoid

1. **Mixing Languages**: Keep Swedish terms consistent - don't mix "property" and "objekt"
2. **Ignoring Timezones**: Always use Europe/Stockholm timezone
3. **Currency Formatting**: Always format as SEK with Swedish conventions
4. **Date Formats**: Use Swedish format (YYYY-MM-DD) or relative dates
5. **Phone Numbers**: Validate Swedish formats (+46, 07x, 08x patterns)
6. **Postal Codes**: Swedish postal codes are 5 digits (XXX XX format)

## Development Workflow

### Project Structure
```
maklarsystem/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── examples/             # Code examples and patterns
└── PRPs/                 # Product requirement prompts
```

### Git Workflow
- Use feature branches: `feature/[feature-name]`
- Commit messages in English or Swedish (be consistent)
- Reference issues/tasks in commits when applicable
- Keep commits atomic and focused

### Code Review Checklist
- [ ] Swedish terminology used consistently
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] TypeScript types defined (no `any`)
- [ ] Tests written for new functionality
- [ ] Accessibility requirements met
- [ ] Mobile responsive design verified
- [ ] Performance impact assessed