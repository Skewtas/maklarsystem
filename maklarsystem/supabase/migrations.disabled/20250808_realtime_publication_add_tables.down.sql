BEGIN;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS
  public.notifikationer,
  public.uppgifter,
  public."kalenderhändelser",
  public.visningar;
COMMIT;


