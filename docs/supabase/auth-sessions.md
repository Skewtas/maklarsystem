### Auth & Sessioner (App Router)

- Varför: Säker hantering av sessions/cookies/CSRF och tydlig separation klient/server.

### Källor (filvägar)
- Klient (anon): `maklarsystem/src/utils/supabase/client.ts`
- Server (service role): `maklarsystem/src/utils/supabase/admin.ts`
- CSRF‑endpoint: `maklarsystem/src/app/api/csrf-token/route.ts`
- Middleware: `maklarsystem/src/middleware.ts`, `maklarsystem/src/middleware/security.ts`

### Principer
- Service role‑nyckel används endast i serverside‑kod (aldrig i klient)
- Adminklient med `autoRefreshToken: false`, `persistSession: false`
- CSRF‑token via egen endpoint och headers i formulär/skript
- Refresh sker via Supabase Auth i klient (anon) där nödvändigt, aldrig för service role

### Hur verifiera (MCP)
- execute_sql: `select 1` (miljö OK)
- get_logs(postgres) vid auth‑flöden för eventuell felsökning






