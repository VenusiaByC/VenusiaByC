import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailTemplate, renderTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { getSiteSettings } from "@/lib/settings";

export async function sendConfirmationEmail(appointmentId: string) {
  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "start_at, client:clients(first_name, email), service:services(name, price)"
    )
    .eq("id", appointmentId)
    .maybeSingle();

  const client = (appointment as any)?.client;
  const service = (appointment as any)?.service;

  if (!appointment || !client?.email) {
    // Pas d'e-mail renseigné par la cliente : rien à envoyer, ce n'est pas
    // une erreur (le téléphone seul est autorisé côté formulaire).
    return;
  }

  const settings = await getSiteSettings();
  const startAt = new Date(appointment.start_at);

  const variables = {
    prenom: client.first_name,
    prestation: service?.name ?? "",
    date: startAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    heure: startAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    prix: String(service?.price ?? ""),
    adresse: settings.contact_address,
    marque: settings.brand_name,
    politique_annulation: settings.cancellation_policy,
  };

  const template = await getEmailTemplate("confirmation");
  const subject = renderTemplate(template.subject, variables);
  const body = renderTemplate(template.body, variables);

  const result = await sendEmail({ to: client.email, subject, text: body });

  await supabase.from("notification_log").insert({
    appointment_id: appointmentId,
    channel: "email",
    recipient: client.email,
    status: result.ok ? "sent" : "failed",
    error_message: result.ok ? null : result.error,
  });
}
