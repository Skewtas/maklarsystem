### Tester

#### SQL (pgTAP)
- Förutsätter att `pgtap` är installerat i schema `test` (se migration 20250808_move_pgtap_schema)
- Kör pgtap‑filerna i `tests/sql/pgtap/*.sql` via SQL‑runner (psql eller Supabase SQL Editor)

#### Jest
- `npm test`

#### Playwright (E2E)
- `npx playwright install --with-deps`
- `npm run e2e`


