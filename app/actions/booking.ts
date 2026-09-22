"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots, isSlotStillAvailable } from "@/lib/availability";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email/confirmation";
import { sendAppointmentSms } from "@/lib/sms/notifications";

export async function getServiceById(serviceId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes, buffer_minutes")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function listActiveServices() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, description, price, duration_minutes, category")
    .eq("active", true)
    .order("display_order");
  return data ?? [];
}

export async function getSlotsForDate(serviceId: string, dateISO: string) {
  const service = await getServiceById(serviceId);
  if (!service) return [];
  const slots = await getAvailableSlots(dateISO, service);
  return slots.map((s) => s.toISOString());
}

export type CreateAppointmentInput = {
  serviceId: string;
  dateISO: string;
  startAtISO: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
};

export type CreateAppointmentResult =
  | { ok: true; appointmentId: string }
  | { ok: false; error: string };

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<CreateAppointmentResult> {
  const service = await getServiceById(input.serviceId);
  if (!service) return { ok: false, error: "Cette prestation n'est plus disponible." };

  if (!input.firstName || !input.lastName || (!input.email && !input.phone)) {
    return { ok: false, error: "Merci de renseigner tes coordonnées." };
  }

  const startAt = new Date(input.startAtISO);

  // Dernière vérification avant écriture : le créneau est-il toujours
  // libre ? (empêche deux clientes de réserver le même créneau en même temps)
  const stillFree = await isSlotStillAvailable(input.dateISO, startAt, service);
  if (!stillFree) {
    return { ok: false, error: "Ce créneau vient d'être réservé par quelqu'un d'autre. Merci d'en choisir un autre." };
  }

  const endAt = new Date(startAt);
  endAt.setMinutes(endAt.getMinutes() + service.duration_minutes);

  const supabase = createAdminClient();

  // Cliente existante (par e-mail) ou nouvelle fiche cliente
  let clientId: string | null = null;
  if (input.email) {
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();
    clientId = existing?.id ?? null;
  }

  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email || null,
        phone: input.phone || null,
      })
      .select("id")
      .single();

    if (clientError || !newClient) {
      return { ok: false, error: "Une erreur est survenue, merci de réessayer." };
    }
    clientId = newClient.id;
  }

  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .insert({
      client_id: clientId,
      service_id: service.id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: "confirmed",
      notes: input.notes ?? "",
    })
    .select("id")
    .single();

  if (apptError || !appointment) {
    return { ok: false, error: "Une erreur est survenue lors de la réservation, merci de réessayer." };
  }

  // TODO (prochaine étape) : envoi du SMS de confirmation ici, via Brevo.
  try {
    await sendConfirmationEmail(appointment.id);
  } catch {
    // On ne fait jamais échouer la réservation à cause d'un souci d'e-mail
    // (déjà tracé dans notification_log par sendConfirmationEmail).
  }
  try {
    await sendAppointmentSms(appointment.id, "confirmation");
  } catch {
    // Idem pour le SMS : jamais bloquant.
  }
  try {
    await sendAdminNotification(appointment.id);
  } catch {
    // Jamais bloquant non plus.
  }

  return { ok: true, appointmentId: appointment.id };
}
