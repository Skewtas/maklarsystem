BEGIN;
-- Add key tables to realtime publication (RLS still enforced)
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.notifikationer,
  public.uppgifter,
  public."kalenderhändelser",
  public.visningar;
COMMIT;


