### Konventioner

- **RLS**
  - Default deny, minsta privilegium
  - Använd `(SELECT auth.uid())` i policies (prestanda)
  - Konsolidera per cmd (INSERT/SELECT/UPDATE/DELETE) i stället för ALL

- **Index**
  - FK-index alltid
  - Undvik lågvärdiga boolean-index

- **Nycklar**
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` i klient
  - `SUPABASE_SERVICE_ROLE_KEY` endast server-side

- **Filer**
  - Migreringar i `maklarsystem/supabase/migrations/*.sql` (up/down)
  - Dokumentation i `docs/supabase/*`






