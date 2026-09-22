"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots, isSlotStillAvailable } from "@/lib/availability";
import { getSiteSettings } from "@/lib/settings";
import { sendAppointmentEmail } from "@/lib/email/confirmation";

/** Cette suite d'actions n'utilise jamais requireAdminUser() : la sécurité
 * repose sur le fait que le "token" (UUID aléatoire) n'est connu que de la
 * cliente, via son e-mail de confirmation — exactement comme un lien de
 * désinscription de newsletter. */

async function loadAppointmentByToken(token: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, status, client_id, service:services(id, name, price, duration_minutes, buffer_minutes)"
    )
    .eq("manage_token", token)
    .maybeSingle();
  return data;
}

export async function getSelfServiceAppointment(token: string) {
  const appointment = await loadAppointmentByToken(token);
  if (!appointment) return null;

  const settings = await getSiteSettings();
  const minHours = parseInt(settings.min_cancellation_hours, 10) || 0;
  const deadline = new Date(appointment.start_at).getTime() - minHours * 60 * 60 * 1000;
  const canManage =
    appointment.status !== "cancelled" &&
    appointment.status !== "completed" &&
    Date.now() < deadline;

  return { appointment, canManage, minHours };
}

export async function selfCancelAppointment(token: string) {
  const result = await getSelfServiceAppointment(token);
  if (!result) return { ok: false as const, error: "Rendez-vous introuvable." };
  if (!result.canManage) {
    return {
      ok: false as const,
      error: `Ce rendez-vous ne peut plus être annulé en ligne (moins de ${result.minHours}h avant). Contacte-nous directement.`,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", result.appointment.id);
  if (error) return { ok: false as const, error: error.message };

  try {
    await sendAppointmentEmail(result.appointment.id, "cancellation");
  } catch {
    // jamais bloquant
  }

  return { ok: true as const };
}

export async function getSelfServiceSlots(token: string, dateISO: string) {
  const result = await getSelfServiceAppointment(token);
  if (!result || !result.canManage) return [];
  const service = (result.appointment as any).service;
  const slots = await getAvailableSlots(dateISO, service);
  return slots.map((s) => s.toISOString());
}

export async function selfRescheduleAppointment(token: string, dateISO: string, newStartAtISO: string) {
  const result = await getSelfServiceAppointment(token);
  if (!result) return { ok: false as const, error: "Rendez-vous introuvable." };
  if (!result.canManage) {
    return {
      ok: false as const,
      error: `Ce rendez-vous ne peut plus être modifié en ligne (moins de ${result.minHours}h avant). Contacte-nous directement.`,
    };
  }

  const service = (result.appointment as any).service;
  const startAt = new Date(newStartAtISO);

  const stillFree = await isSlotStillAvailable(dateISO, startAt, service);
  if (!stillFree) {
    return { ok: false as const, error: "Ce créneau vient d'être pris. Merci d'en choisir un autre." };
  }

  const endAt = new Date(startAt);
  endAt.setMinutes(endAt.getMinutes() + service.duration_minutes);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ start_at: startAt.toISOString(), end_at: endAt.toISOString() })
    .eq("id", result.appointment.id);
  if (error) return { ok: false as const, error: error.message };

  try {
    await sendAppointmentEmail(result.appointment.id, "reschedule");
  } catch {
    // jamais bloquant
  }

  return { ok: true as const };
}
