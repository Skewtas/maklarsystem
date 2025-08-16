### CI (DB + Tester)

- Steg
  - Kör migreringar (SQL) mot testmiljö
  - Kör pgTAP (valfritt) + Jest/Playwright
  - Kör MCP advisors (security/performance) och larma vid WARN/CRIT

- Kommandon (exempel)
  - MCP: list_migrations, get_advisors(type=security|performance)
  - Test: `npm run test` / `npm run e2e`






