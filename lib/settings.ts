import { createClient } from "@/lib/supabase/server";

/**
 * Tout ce qui est modifiable depuis l'espace admin passe par ce fichier.
 * Rien de tout cela n'est codé en dur dans les pages : les pages appellent
 * `getSiteSettings()` et affichent ce que la propriétaire a configuré.
 *
 * En base, ces réglages vivent dans la table `settings` sous forme de
 * paires clé/valeur (voir supabase/schema.sql). Cela permet d'ajouter de
 * nouveaux réglages plus tard sans migration de schéma.
 *
 * Tant que la table `settings` est vide (site tout juste installé), des
 * valeurs par défaut ci-dessous sont utilisées, pour que le site reste
 * fonctionnel et cohérent avec la direction visuelle validée.
 */

export type SiteSettings = {
  brand_name: string;
  logo_url: string | null;
  color_bg: string;
  color_surface: string;
  color_ink: string;
  color_ink_soft: string;
  color_accent: string;
  color_accent_dark: string;
  color_blush: string;
  color_gold: string;
  font_serif: string;
  font_sans: string;
  hero_title: string;
  hero_subtitle: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  instagram_handle: string;
  cancellation_policy: string;
  loyalty_enabled: string; // "true" | "false" (stocké en texte comme le reste des settings)
  loyalty_points_per_visit: string;
  loyalty_reward_threshold: string;
  loyalty_reward_description: string;
  owner_notification_email: string;
  site_url: string;
  min_cancellation_hours: string;
  payments_enabled: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: "Venusia",
  logo_url: null,
  color_bg: "#FBF6F1",
  color_surface: "#FFFEFC",
  color_ink: "#2B1C22",
  color_ink_soft: "#6E5A5F",
  color_accent: "#7C2A3D",
  color_accent_dark: "#5E1F2E",
  color_blush: "#F1DCDD",
  color_gold: "#B08A55",
  font_serif: "Fraunces",
  font_sans: "Work Sans",
  hero_title: "Des ongles qui vous ressemblent, un rendez-vous en deux minutes.",
  hero_subtitle:
    "Pose américaine, manucure russe, nail art sur-mesure — dans un cadre pensé pour prendre soin de vous.",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  instagram_handle: "",
  cancellation_policy: "Annulation possible jusqu'à 24h avant le rendez-vous.",
  loyalty_enabled: "false",
  loyalty_points_per_visit: "1",
  loyalty_reward_threshold: "10",
  loyalty_reward_description: "10% de réduction sur la prochaine prestation",
  owner_notification_email: "",
  site_url: "",
  min_cancellation_hours: "24",
  payments_enabled: "false",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("settings").select("key, value");

    if (error || !data || data.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const overrides = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return { ...DEFAULT_SETTINGS, ...overrides };
  } catch {
    // Si Supabase n'est pas encore configuré (variables d'environnement
    // absentes), on retombe sur les valeurs par défaut plutôt que de
    // planter le site.
    return DEFAULT_SETTINGS;
  }
}
