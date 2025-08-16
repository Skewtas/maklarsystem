### Säkerhetschecklista (Release)

- RLS aktiverad på alla tabeller, konsoliderade policies
- Policies använder `(SELECT auth.uid())`
- Service role-nyckel endast i serverkod
- OTP expiry < 1h (Auth-inställning)
- Leaked password protection aktiverad
- CSRF-skydd aktivt (`/api/csrf-token`, middleware)
- Inga dubblettindex

Verifiera med MCP:
- get_advisors(security)






