### Arkitektur (Maklarsystem + Supabase)

- **Stack**: Next.js App Router (TypeScript) + Supabase (Postgres, Auth, RLS, Storage, Realtime)
- **Kärnprinciper**
  - Service role-nyckel används endast på serversidan
  - Klient använder endast `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - RLS: default deny, minsta privilegium, konsoliderade policies
  - Indexering på FK och typiska filterfält

### Klient- och serverklienter

- Klient (anon, endast i browser):
  - `maklarsystem/src/utils/supabase/client.ts`
- Admin/server (service role, endast server):
  - `maklarsystem/src/utils/supabase/admin.ts`

### API och Middleware

- API-rutter (App Router): `maklarsystem/src/app/api/**`
- CSRF-token endpoint: `maklarsystem/src/app/api/csrf-token/route.ts`
- Säkerhetsmiddleware: `maklarsystem/src/middleware.ts` och `maklarsystem/src/middleware/security.ts`

### Databas och migreringar

- Supabase-katalog: `maklarsystem/supabase/`
  - `migrations/*.sql` (up/down)
  - `schema.sql` (referens)

### Varför

- Tydlig separation mellan klient (anon) och server (service role) för att skydda data och följa RLS.

### Hur verifiera

- Hämta projektuppgifter (MCP):
  - get_project_url / get_anon_key
- Kontrollera tabeller och RLS:
  - list_tables(schemas=["public"]) – se `rls_enabled: true`
- Rådgivare:
  - get_advisors(type=security|performance)






