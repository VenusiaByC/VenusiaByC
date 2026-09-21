import { createClient } from "@/lib/supabase/server";

/**
 * À appeler en tout début de chaque Server Action sensible (créer/modifier/
 * supprimer des données). La protection des pages /admin/* est déjà assurée
 * par middleware.ts, mais une Server Action peut techniquement être
 * appelée directement : on vérifie donc aussi ici, par sécurité.
 */
export async function requireAdminUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Non autorisé");
  }
  return user;
}
