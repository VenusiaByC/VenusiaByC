import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailTemplate, renderTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { getSiteSettings } from "@/lib/settings";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

export type AppointmentEmailKind = "confirmation" | "cancellation" | "reschedule";

/**
 * Envoie l'e-mail correspondant à un événement sur un rendez-vous
 * (nouvelle réservation, annulation, déplacement), en utilisant le modèle
 * personnalisé depuis l'admin s'il existe, sinon un modèle par défaut.
 */
export async function sendAppointmentEmail(appointmentId: string, kind: AppointmentEmailKind) {
  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("start_at, client:clients(first_name, email), service:services(name, price)")
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
    date: formatParisDate(startAt, { weekday: "long", day: "numeric", month: "long" }),
    heure: formatParisTime(startAt),
    prix: String(service?.price ?? ""),
    adresse: settings.contact_address,
    marque: settings.brand_name,
    politique_annulation: settings.cancellation_policy,
  };

  const template = await getEmailTemplate(kind);
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

/** Conservé pour compatibilité avec le code existant. */
export async function sendConfirmationEmail(appointmentId: string) {
  return sendAppointmentEmail(appointmentId, "confirmation");
}

/** Prévient la propriétaire par e-mail qu'une cliente vient de réserver en
 * ligne (pas utilisé pour les rendez-vous qu'elle crée elle-même, puisqu'elle
 * le sait déjà). */
export async function sendAdminNotification(appointmentId: string) {
  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "start_at, client:clients(first_name, last_name, phone, email), service:services(name, price)"
    )
    .eq("id", appointmentId)
    .maybeSingle();

  const client = (appointment as any)?.client;
  const service = (appointment as any)?.service;
  if (!appointment) return;

  const settings = await getSiteSettings();
  const recipient = settings.owner_notification_email || process.env.SMTP_USER;
  if (!recipient) return; // rien de configuré, on ne bloque pas la réservation pour ça

  const startAt = new Date(appointment.start_at);

  const variables = {
    prenom: client?.first_name ?? "",
    nom: client?.last_name ?? "",
    telephone: client?.phone ?? "—",
    email: client?.email ?? "—",
    prestation: service?.name ?? "",
    date: formatParisDate(startAt, { weekday: "long", day: "numeric", month: "long" }),
    heure: formatParisTime(startAt),
    prix: String(service?.price ?? ""),
    marque: settings.brand_name,
  };

  const template = await getEmailTemplate("admin_notification");
  const subject = renderTemplate(template.subject, variables);
  const body = renderTemplate(template.body, variables);

  const result = await sendEmail({ to: recipient, subject, text: body });

  await supabase.from("notification_log").insert({
    appointment_id: appointmentId,
    channel: "email",
    recipient,
    status: result.ok ? "sent" : "failed",
    error_message: result.ok ? null : result.error,
  });
}
