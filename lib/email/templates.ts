import { createAdminClient } from "@/lib/supabase/admin";
export { renderTemplate } from "@/lib/render-template";

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

Besoin d'annuler ou de changer l'heure ? {{lien_gestion}}

À très vite,
{{marque}}`,
  },
  cancellation: {
    subject: "Ton rendez-vous chez {{marque}} a été annulé",
    body: `Bonjour {{prenom}},

Ton rendez-vous du {{date}} à {{heure}} ({{prestation}}) a été annulé.

N'hésite pas à reprendre rendez-vous quand tu le souhaites.

{{marque}}`,
  },
  reschedule: {
    subject: "Ton rendez-vous chez {{marque}} a été déplacé",
    body: `Bonjour {{prenom}},

Ton rendez-vous a été déplacé.

Nouvelle date : {{date}}
Nouvelle heure : {{heure}}
Prestation : {{prestation}}
Prix : {{prix}} €
Adresse : {{adresse}}

À très vite,
{{marque}}`,
  },
  admin_notification: {
    subject: "Nouvelle réservation : {{prenom}} {{nom}} — {{date}} à {{heure}}",
    body: `Nouvelle réservation en ligne !

Cliente : {{prenom}} {{nom}}
Téléphone : {{telephone}}
E-mail : {{email}}

Prestation : {{prestation}}
Date : {{date}}
Heure : {{heure}}
Prix : {{prix}} €

Le rendez-vous est déjà enregistré dans l'admin, section Rendez-vous.`,
  },
  gift_card_delivery: {
    subject: "Ta carte cadeau {{marque}} — {{montant}} €",
    body: `Bonjour {{prenom}},

Voici ta carte cadeau {{marque}} d'une valeur de {{montant}} € !

Code : {{code}}

{{message}}

À utiliser en une ou plusieurs fois, lors d'une réservation ou directement en institut.

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
