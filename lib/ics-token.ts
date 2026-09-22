import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTING_KEY = "ics_feed_token";

/** Récupère le jeton secret protégeant le flux calendrier, ou en crée un
 * la toute première fois qu'on en a besoin. */
export async function getOrCreateIcsToken(): Promise<string> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("settings").select("value").eq("key", SETTING_KEY).maybeSingle();
  if (data?.value) return data.value;

  const token = crypto.randomBytes(24).toString("hex");
  await supabase.from("settings").upsert({ key: SETTING_KEY, value: token }, { onConflict: "key" });
  return token;
}

/** Invalide l'ancien lien et en génère un nouveau (en cas de lien partagé
 * par erreur, par exemple). */
export async function regenerateIcsToken(): Promise<string> {
  const supabase = createAdminClient();
  const token = crypto.randomBytes(24).toString("hex");
  await supabase.from("settings").upsert({ key: SETTING_KEY, value: token }, { onConflict: "key" });
  return token;
}
