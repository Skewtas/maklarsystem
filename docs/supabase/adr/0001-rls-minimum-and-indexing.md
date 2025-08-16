### ADR‑Light 0001: RLS minimum & Indexering

- Beslut: Använd default deny + minsta privilegium, konsolidera policies per cmd, använd `(SELECT auth.uid())`.
- Konsekvenser: Färre policy‑utvärderingar, bättre prestanda och tydlighet.
- Indexering: Lägg FK‑index, ta bort dubbletter och lågvärdiga index.
- Migreringar: 20250808_* (se `maklarsystem/supabase/migrations/`)






