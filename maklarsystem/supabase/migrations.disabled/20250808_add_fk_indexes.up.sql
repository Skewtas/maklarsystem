BEGIN;
-- FK coverage indexes for performance
CREATE INDEX IF NOT EXISTS idx_bud_objekt_id ON public.bud(objekt_id);
CREATE INDEX IF NOT EXISTS idx_bud_spekulant_id ON public.bud(spekulant_id);

CREATE INDEX IF NOT EXISTS idx_objekt_saljare_id ON public.objekt(saljare_id);
CREATE INDEX IF NOT EXISTS idx_objekt_kopare_id ON public.objekt(kopare_id);

CREATE INDEX IF NOT EXISTS idx_uppgifter_objekt_id ON public.uppgifter(objekt_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_kontakt_id ON public.uppgifter(kontakt_id);
CREATE INDEX IF NOT EXISTS idx_uppgifter_skapad_av ON public.uppgifter(skapad_av);
CREATE INDEX IF NOT EXISTS idx_uppgifter_tilldelad_till ON public.uppgifter(tilldelad_till);

CREATE INDEX IF NOT EXISTS idx_kalenderhandelser_objekt_id ON public."kalenderhändelser"(objekt_id);
CREATE INDEX IF NOT EXISTS idx_kalenderhandelser_kontakt_id ON public."kalenderhändelser"(kontakt_id);

CREATE INDEX IF NOT EXISTS idx_visningar_objekt_id ON public.visningar(objekt_id);
COMMIT;


