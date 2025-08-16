import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const auth = req.headers.get('authorization') || ''
  const ok = auth.toLowerCase().startsWith('bearer ')
  return new Response(JSON.stringify({ ok }), {
    headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' }
  })
});






