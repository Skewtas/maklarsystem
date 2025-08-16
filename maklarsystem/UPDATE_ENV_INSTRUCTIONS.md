# 🔧 Uppdatera Miljövariabler

## Viktigt: Uppdatera din `.env.local` fil

Eftersom vi har migrerat till ett nytt Supabase-projekt, måste du uppdatera dina miljövariabler.

### 1. Hämta dina nya credentials från Supabase

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard)
2. Välj ditt projekt (Skewtas's Project)
3. Gå till **Settings** → **API**
4. Kopiera:
   - **Project URL**
   - **Anon/Public Key**
   - **Service Role Key** (hemlig!)

### 2. Uppdatera `.env.local`

```bash
# Gamla värden (kwxxpypgtdfimmxnipaz projekt - HAR INLOGGNINGSPROBLEM)
# NEXT_PUBLIC_SUPABASE_URL=https://kwxxpypgtdfimmxnipaz.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# NYA värden (ditt nya projekt med fungerande auth)
NEXT_PUBLIC_SUPABASE_URL=https://[DITT-NYA-PROJEKT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...[din-nya-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...[din-nya-service-key]

# Behåll denna för test
ALLOW_TEST_ROUTES=true
```

### 3. Starta om utvecklingsservern

```bash
# Stoppa servern (Ctrl+C)
# Starta om
cd maklarsystem
npm run dev
```

### 4. Testa den nya konfigurationen

1. **Registrera ny användare** - Ska fungera nu med auth-trigger
2. **Logga in** - Ska fungera utan problem
3. **Skapa objekt** - Testa att alla nya fält fungerar

## ✅ Bekräftelse av migrationen

Alla kritiska komponenter är installerade:
- ✅ Auth trigger för automatisk användarsynkronisering
- ✅ Svenska fastighetsfält (fastighetsbeteckning, energiklass, etc.)
- ✅ Nya tabeller (dokument, intresseanmälningar, budhistorik)
- ✅ Performance-optimeringar (20+ nya index)
- ✅ Text-sök för svenska texter

## 🚨 Viktigt

- **Använd INTE det gamla projektet** (kwxxpypgtdfimmxnipaz) - det har inloggningsproblem
- **Använd det nya projektet** där vi just installerat alla migrationer
- **Spara dina credentials säkert** - särskilt Service Role Key

## 📞 Support

Om något inte fungerar:
1. Kontrollera att miljövariablerna är korrekta
2. Verifiera i Supabase Dashboard att användare skapas
3. Kolla browser console för eventuella fel
4. Kontrollera att auth-triggern är aktiv i databasen