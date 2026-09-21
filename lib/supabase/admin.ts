import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client "service role" — accès total à la base, RLS ignorée.
 *
 * IMPORTANT : ce fichier ne doit JAMAIS être importé depuis un composant
 * "use client" ni depuis du code exécuté dans le navigateur. Il est réservé
 * aux Server Actions et Route Handlers, où la clé reste côté serveur.
 *
 * C'est ce client qui permet, par exemple, de créer un rendez-vous en
 * vérifiant nous-mêmes (dans le code serveur) qu'il n'y a pas de chevauchement,
 * plutôt que de faire confiance à une écriture directe depuis le navigateur.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
