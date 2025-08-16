### ADR‑Light 0002: Edge & Realtime

- Beslut: Edge functions för JWT‑verifiering/webhookar nära databasen; Realtime för notiser/uppgifter.
- Konsekvenser: Lägre latens, enklare säkerhet, färre roundtrips.
- Implementerat: `edge/verify-jwt/index.ts` (ACTIVE), publication för notifikationer/uppgifter/kalender/visningar.






