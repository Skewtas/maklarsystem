### API- och klientmönster

- **Klient (browser)**
  - Fil: `maklarsystem/src/utils/supabase/client.ts`
  - Använder `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Server (admin)**
  - Fil: `maklarsystem/src/utils/supabase/admin.ts`
  - Använder `SUPABASE_SERVICE_ROLE_KEY` – endast i serverkod

- **Fel och retries**
  - Wrappa anrop och exponera typade fel
  - Använd React Query där lämpligt (cache/invalidering): `maklarsystem/src/lib/query-provider.tsx`

- **Exempel**
```ts
// server example
import { createAdminClient } from '@/utils/supabase/admin'

export async function listUsers() {
  const supabase = createAdminClient()
  return supabase.from('users').select('id,email,role')
}
```






