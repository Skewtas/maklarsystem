### Auth: Produktionsinställningar

- OTP expiry < 1h (Supabase Dashboard → Auth → Providers → Email)
- Aktivera Leaked Password Protection (HaveIBeenPwned)
- Begränsa redirect‑domäner till betrodda
- Inaktivera onödiga providers
- Rotera nycklar regelbundet

Verifiera med MCP:
- get_advisors(security) tills varningarna försvinner






