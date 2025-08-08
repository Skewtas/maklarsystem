# 🚀 MÄKLARSYSTEM - NÄSTA STEG ROADMAP

## 📊 Nuläge (2025-08-07)
- **Completion**: 16.67% (2/12 huvudtasks klara)
- **Sprint**: 3-4 av 6 (Vecka 5-8)
- **Blockerare**: Authentication (Next.js 15 kompatibilitet)
- **Status**: UI klar, men saknar riktig funktionalitet

## 🎯 MÅL FÖR NÄSTA 2 VECKOR
Få systemet funktionellt med riktiga data och grundläggande CRUD-operationer.

---

## 📅 VECKA 1: Authentication & Data Layer (7-14 Augusti)

### Dag 1-2: Måndag-Tisdag (7-8 Aug)
#### 🔐 Lösa Authentication Blockering
```bash
# STEG 1: Research alternativ
□ Undersök Supabase SSR paketet (Next.js 15 kompatibel)
□ Testa @supabase/ssr istället för auth-helpers
□ Dokumentera lösningen

# STEG 2: Implementation
□ Ta bort gamla auth-helpers
npm uninstall @supabase/auth-helpers-nextjs

□ Installera nya paket
npm install @supabase/ssr @supabase/supabase-js@latest

□ Skapa ny auth setup
- src/utils/supabase/server.ts (server components)
- src/utils/supabase/client.ts (client components)
- src/middleware.ts (session refresh)
```

**Filer att uppdatera:**
- [ ] `/src/utils/supabase/server.ts`
- [ ] `/src/utils/supabase/client.ts`
- [ ] `/src/middleware.ts`
- [ ] `/src/app/login/page.tsx`
- [ ] `/src/app/auth/actions.ts`

### Dag 3: Onsdag (9 Aug)
#### 🔌 Supabase Data Integration - Del 1
```typescript
// Skapa API hooks med React Query
□ Installera React Query
npm install @tanstack/react-query

□ Skapa QueryClient provider
// src/providers/query-provider.tsx

□ Skapa första data hooks
// src/hooks/useProperties.ts
export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}
```

### Dag 4-5: Torsdag-Fredag (10-11 Aug)
#### 🏠 Objekt (Properties) CRUD - Backend
```typescript
// API Routes att skapa:
□ POST   /api/properties          - Skapa nytt objekt
□ GET    /api/properties          - Lista objekt
□ GET    /api/properties/[id]     - Hämta ett objekt
□ PUT    /api/properties/[id]     - Uppdatera objekt
□ DELETE /api/properties/[id]     - Ta bort objekt

// Exempel: app/api/properties/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('properties')
    .insert(body)
    .select()
    .single();
    
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(data);
}
```

---

## 📅 VECKA 2: Forms & Full CRUD (14-21 Augusti)

### Dag 6-7: Måndag-Tisdag (14-15 Aug)
#### 📝 Objekt Forms & Validation
```typescript
// Prioriterade fält för MVP:
const propertySchema = z.object({
  // Grundinfo
  title: z.string().min(1, "Titel krävs"),
  objekttyp: z.enum(['villa', 'lagenhet', 'radhus', 'tomt']),
  adress: z.string().min(1, "Adress krävs"),
  kommun: z.string().min(1, "Kommun krävs"),
  pris: z.number().min(0, "Pris måste vara positivt"),
  
  // Storlek
  antal_rum: z.number().min(1),
  boarea: z.number().min(0),
  tomtarea: z.number().optional(),
  
  // Status
  status: z.enum(['kommande', 'till_salu', 'under_bud', 'sald'])
});
```

**UI Components att skapa:**
- [ ] `PropertyForm.tsx` - Huvudformulär
- [ ] `PropertyFields.tsx` - Fältkomponenter
- [ ] `PropertyValidation.ts` - Zod schemas

### Dag 8: Onsdag (16 Aug)
#### 👥 Kontakter CRUD
```typescript
// Snabb implementation av kontakthantering
□ API routes för kontakter
□ Kontaktformulär (enklare än objekt)
□ Lista och sök funktionalitet

const contactSchema = z.object({
  fornamn: z.string().min(1),
  efternamn: z.string().min(1),
  email: z.string().email(),
  telefon: z.string(),
  typ: z.enum(['saljare', 'kopare', 'spekulant'])
});
```

### Dag 9-10: Torsdag-Fredag (17-18 Aug)
#### 👁️ Visningar (Viewings) - Grundläggande
```typescript
// MVP version av visningar
□ Skapa visning för ett objekt
□ Lista visningar
□ Registrera deltagare (enkel lista)

const viewingSchema = z.object({
  property_id: z.string().uuid(),
  datum: z.date(),
  tid: z.string(),
  max_deltagare: z.number().default(20)
});
```

---

## 🔄 DAGLIG RUTIN

### Morgon (9:00)
```bash
# 1. Kolla status
git status
npm run dev

# 2. Testa auth
- Kan jag logga in?
- Fungerar session refresh?

# 3. Testa data
- Laddas properties från Supabase?
- Fungerar CRUD operationer?
```

### Lunch Check (12:00)
- [ ] Minst 1 feature implementerad
- [ ] Inga console errors
- [ ] Commit ändringar

### Kväll (17:00)
```bash
# Daglig commit
git add .
git commit -m "feat: [vad du gjort]"
git push
```

---

## ✅ DEFINITION OF DONE - VECKA 1

### Must Have (Kritiskt)
- [ ] ✅ Authentication fungerar med Next.js 15
- [ ] ✅ Kan logga in/ut
- [ ] ✅ Properties laddas från Supabase (inte mock)
- [ ] ✅ Kan skapa nytt objekt via formulär
- [ ] ✅ Kan redigera befintligt objekt

### Should Have (Viktigt)
- [ ] Kontakter CRUD fungerar
- [ ] Bilduppladdning för objekt
- [ ] Filtrering av objekt fungerar
- [ ] Validering på alla formulär

### Nice to Have (Om tid finns)
- [ ] Visningar kan schemaläggas
- [ ] Real-time updates via Supabase
- [ ] Bulk operations
- [ ] Export funktionalitet

---

## 🚨 KRITISKA FILER ATT FOKUSERA PÅ

### Vecka 1 Prioritet
1. `/src/middleware.ts` - Auth middleware
2. `/src/app/api/properties/route.ts` - API endpoints  
3. `/src/app/nytt/page.tsx` - Create property form
4. `/src/hooks/useProperties.ts` - Data fetching

### Vecka 2 Prioritet
1. `/src/components/forms/PropertyForm.tsx`
2. `/src/app/objekt/[id]/edit/page.tsx`
3. `/src/app/kontakter/page.tsx`
4. `/src/app/visningar/page.tsx`

---

## 📊 FÖRVÄNTAD PROGRESS

### Efter Vecka 1
- **Completion**: ~30% (4/12 tasks)
- **Funktionalitet**: Auth + Basic CRUD
- **Data**: Riktig data från Supabase

### Efter Vecka 2  
- **Completion**: ~45% (5-6/12 tasks)
- **Funktionalitet**: Full CRUD för objekt & kontakter
- **Ready for**: User testing

---

## 🆘 OM DU FASTNAR

### Auth Problem
```bash
# Alternativ lösning - Custom JWT
npm install jose
# Implementera egen JWT-baserad auth
```

### Supabase Problem
```bash
# Kolla connection
npx supabase status
npx supabase db reset
```

### Form Problem
```bash
# Använd färdiga exempel
cp /docs/examples/PropertyForm.example.tsx /src/components/forms/PropertyForm.tsx
```

---

## 📝 ANTECKNINGAR

**Kom ihåg:**
- Committa ofta (minst 2x per dag)
- Testa i Chrome, Safari & Firefox
- Kör `npm run lint` innan commit
- Dokumentera alla API endpoints
- Använd svenska termer i UI

**Nästa sprint planning:** 21 Augusti 2025

---

*Denna roadmap uppdateras dagligen. Markera ✅ när tasks är klara.*