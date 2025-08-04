-- ANVÄND RÄTT ID FÖR ANNA!
-- Anna's ID i public.users är: 6a0af328-9be6-4dd9-ae83-ce2cf512da6d

INSERT INTO objekt (
  adress,
  postnummer,
  ort,
  kommun,
  lan,
  typ,
  status,
  maklare_id
) VALUES (
  'Testgatan 999',
  '12345',
  'Teststad',
  'Stockholm',
  'Stockholm',
  'villa',
  'kundbearbetning',
  '6a0af328-9be6-4dd9-ae83-ce2cf512da6d'  -- RÄTT ID för Anna från public.users!
);

-- Ta bort testobjektet efteråt
DELETE FROM objekt WHERE adress = 'Testgatan 999';