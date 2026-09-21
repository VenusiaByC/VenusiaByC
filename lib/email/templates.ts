import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Modèles d'e-mail. Chaque modèle est identifié par un `name` unique
 * ("confirmation", "rappel"...) et vit dans la table `email_templates`.
 * Si aucune ligne n'existe encore en base pour ce nom, on utilise un
 * modèle par défaut ci-dessous, pour que les e-mails partent même avant
 * toute personnalisation depuis l'admin.
 */

export type EmailTemplate = { subject: string; body: string };

const DEFAULTS: Record<string, EmailTemplate> = {
  confirmation: {
    subject: "Confirmation de ton rendez-vous chez {{marque}}",
    body: `Bonjour {{prenom}},

Ton rendez-vous est confirmé !

Prestation : {{prestation}}
Date : {{date}}
Heure : {{heure}}
Prix : {{prix}} €
Adresse : {{adresse}}

{{politique_annulation}}

À très vite,
{{marque}}`,
  },
};

export async function getEmailTemplate(name: string): Promise<EmailTemplate> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("email_templates")
      .select("subject, body")
      .eq("name", name)
      .maybeSingle();

    if (data) return data;
  } catch {
    // on retombe sur le modèle par défaut ci-dessous
  }
  return DEFAULTS[name] ?? { subject: "", body: "" };
}

/** Remplace les {{variables}} par leurs valeurs dans un texte. */
export function renderTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] ?? "");
}
