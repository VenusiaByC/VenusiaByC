/**
 * Envoi de SMS via Brevo. Pensé pour pouvoir changer de fournisseur plus
 * tard sans toucher au reste du code : tout ce qui appelle sendSms() n'a
 * pas besoin de savoir que c'est Brevo derrière.
 */
export async function sendSms({
  to,
  content,
}: {
  to: string; // format international, ex: +33612345678
  content: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.BREVO_API_KEY) {
    return { ok: false, error: "Configuration SMS manquante (BREVO_API_KEY)" };
  }

  const normalized = normalizePhoneNumber(to);
  if (!normalized) {
    return { ok: false, error: "Numéro de téléphone invalide" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: (process.env.BREVO_SMS_SENDER || "Venusia").slice(0, 11),
        recipient: normalized,
        content,
        type: "transactional",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: `Fournisseur SMS indisponible ou requête refusée : ${errorText}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi SMS inconnue" };
  }
}

/** Convertit un numéro français (06..., 07..., 01... ou déjà en +33) au
 * format international attendu par Brevo. */
function normalizePhoneNumber(raw: string): string | null {
  const digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "+33" + digits.slice(1);
  if (digits.startsWith("33")) return "+" + digits;
  return null;
}
