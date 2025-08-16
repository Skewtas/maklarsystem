### Realtime & Eventing

- Varför: Live‑upplevelser (notiser, uppgifter, visningar) utan onödig polling.
- Kanaler: Filtrera per tabell och kolumn, RLS gäller alltid.

### Tabeller i publication
- `public.notifikationer`, `public.uppgifter`, `public.kalenderhändelser`, `public.visningar`
- Migration: `maklarsystem/supabase/migrations/20250808_realtime_publication_add_tables.up.sql`

### När realtime vs polling
- Realtime: UI‑notiser, statusförändringar, nya uppgifter/visningar
- Polling: Tunga rapporter, batch‑lägen, låg frekvens

### Hur verifiera (MCP)
- execute_sql: `select pubname, puballtables from pg_publication where pubname='supabase_realtime'`






