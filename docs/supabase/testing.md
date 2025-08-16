### Testning & Kvalitet

- SQL/Policies: pgTAP installerad via `20250808_install_pgtap.up.sql`
- Server‑API: Jest/Playwright (se `maklarsystem/tests/**`)
- Klientflöden: React Testing Library + Playwright
- CI: kör databas‑migreringar + testsvit

### Hur verifiera (MCP)
- list_extensions: kontrollera `pgtap`
- get_logs/get_advisors efter E2E för att upptäcka regressions






