### Lagring (Storage)

- Varför: Privat bucket för bilder med minsta privilegium via RLS.
- Bucket: `property-images` (privat)
- Policies: ägare (owner) kan INSERT/SELECT/UPDATE/DELETE i bucketen; admin via serversida.

### Filvägar
- Migration: `maklarsystem/supabase/migrations/20250808_storage_property_images_v2.up.sql`
- API‑exempel (server): `maklarsystem/src/app/api/properties/[id]/images/route.ts` (ladda upp/signera)

### Hur verifiera (MCP)
- execute_sql: `select id, public from storage.buckets where id='property-images'`
- get_advisors(security): inga nya varningar

### Användning i klient
- Ladda upp via `POST /api/properties/[id]/images` (multipart/form-data med `file`)
- Visa bild via `POST /api/properties/[id]/images/signed-url` med `{ imageId, expiresIn }` → signerad URL


