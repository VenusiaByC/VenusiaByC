import { createAdminClient } from "@/lib/supabase/admin";
import { getSmsTemplate } from "@/lib/sms/templates";
import { renderTemplate } from "@/lib/render-template";
import { sendSms } from "@/lib/sms/send";
import { getSiteSettings } from "@/lib/settings";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

export type SmsKind = "confirmation" | "reminder";

export async function sendAppointmentSms(appointmentId: string, kind: SmsKind) {
  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("start_at, client:clients(first_name, phone), service:services(name, price)")
    .eq("id", appointmentId)
    .maybeSingle();

  const client = (appointment as any)?.client;
  const service = (appointment as any)?.service;

  if (!appointment || !client?.phone) {
    // Pas de téléphone renseigné : rien à envoyer, pas une erreur.
    return;
  }

  const settings = await getSiteSettings();
  const startAt = new Date(appointment.start_at);

  const variables = {
    prenom: client.first_name,
    prestation: service?.name ?? "",
    date: formatParisDate(startAt, { day: "numeric", month: "long" }),
    heure: formatParisTime(startAt),
    prix: String(service?.price ?? ""),
    marque: settings.brand_name,
  };

  const template = await getSmsTemplate(kind);
  const content = renderTemplate(template, variables);

  const result = await sendSms({ to: client.phone, content });

  await supabase.from("notification_log").insert({
    appointment_id: appointmentId,
    channel: "sms",
    recipient: client.phone,
    status: result.ok ? "sent" : "failed",
    error_message: result.ok ? null : result.error,
  });

  return result;
}
