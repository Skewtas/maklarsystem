# Vitec Express - Systemarkitektur

## Identifierade system och portaler

### 1. Express Portal (Huvudsystem)
- **URL**: express.maklare.vitec.net
- **Funktion**: Huvudsakliga mäklarsystemet för daglig verksamhet
- **Användare**: Mäklare och assistenter

### 2. Connect Portal (Administration)
- **URL**: connectportal.maklare.vitec.net
- **Funktion**: Troligen administrationsportal för:
  - Användarhantering
  - Systemkonfiguration
  - Företagsinställningar
  - Integrationer
  - Rapporter på företagsnivå

## Tekniska observationer

### Autentisering
- Separata inloggningar för olika portaler
- Användarnamn: email-baserat (företagsdomän)
- Lösenordshantering via webbläsare stöds

### Domänstruktur
- Subdomäner för olika tjänster
- `.maklare.vitec.net` som huvuddomän
- Separation av concerns mellan portaler

## Implikationer för Mäklarsystem

### Arkitektur-beslut
1. **Multi-portal approach**
   - Separera administration från daglig användning
   - Olika användarroller och behörigheter per portal

2. **Domänstrategi**
   - Subdomäner för olika tjänster
   - Exempel: `app.maklarsystem.se`, `admin.maklarsystem.se`

3. **Autentisering**
   - Single Sign-On (SSO) mellan portaler
   - Rollbaserad åtkomstkontroll (RBAC)

### Förslag på portalstruktur för Mäklarsystem

```
maklarsystem.se/
├── app.maklarsystem.se         # Huvudapplikation
├── admin.maklarsystem.se       # Administration
├── api.maklarsystem.se         # API endpoints
├── connect.maklarsystem.se     # Integrationer
└── portal.maklarsystem.se      # Kundportal
```

## Säkerhetsöverväganden

1. **Separation av miljöer**
   - Olika säkerhetsnivåer för olika portaler
   - Admin-portal med extra säkerhet (2FA, IP-whitelisting)

2. **Session-hantering**
   - Delad session mellan relaterade tjänster
   - Timeout-hantering per portal

3. **API-säkerhet**
   - OAuth 2.0 för API-access
   - Rate limiting per portal/användare