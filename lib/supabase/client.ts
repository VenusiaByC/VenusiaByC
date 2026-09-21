import { createBrowserClient } from "@supabase/ssr";

// Client Supabase utilisé côté navigateur (dans les composants "use client").
// Les clés utilisées ici sont PUBLIQUES par design (clé "anon" de Supabase) :
// la vraie protection des données se fait via les règles RLS définies dans
// supabase/schema.sql, pas en cachant cette clé.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
