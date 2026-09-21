import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULTS: Record<string, string> = {
  confirmation:
    "Bonjour {{prenom}}, ton rendez-vous {{marque}} du {{date}} à {{heure}} est confirmé. À bientôt !",
  reminder:
    "Bonjour {{prenom}}, petit rappel : ton rendez-vous {{marque}} est prévu le {{date}} à {{heure}}. À bientôt !",
};

export async function getSmsTemplate(name: string): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("sms_templates").select("body").eq("name", name).maybeSingle();
    if (data) return data.body;
  } catch {
    // on retombe sur le modèle par défaut
  }
  return DEFAULTS[name] ?? "";
}
