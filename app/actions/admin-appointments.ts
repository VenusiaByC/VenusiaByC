"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/availability";
import { todayISOInBusinessTZ } from "@/lib/timezone";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no_show";

export async function listAppointments(dateISO?: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  let query = supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, status, notes, client:clients(id, first_name, last_name, phone, email), service:services(id, name, price, duration_minutes)"
    )
    .order("start_at");

  if (dateISO) {
    query = query.gte("start_at", `${dateISO}T00:00:00Z`).lte("start_at", `${dateISO}T23:59:59Z`);
  } else {
    // Par défaut : à partir d'aujourd'hui, pour ne pas noyer sous l'historique
    query = query.gte("start_at", `${todayISOInBusinessTZ()}T00:00:00Z`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getAppointmentDetail(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, status, notes, client:clients(id, first_name, last_name, phone, email, internal_notes), service:services(id, name, price, duration_minutes, buffer_minutes)"
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function rescheduleAppointment(id: string, newStartAtISO: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select("service:services(duration_minutes)")
    .eq("id", id)
    .maybeSingle();
  const durationMinutes = (appt as any)?.service?.duration_minutes;
  if (!durationMinutes) return { ok: false as const, error: "Rendez-vous introuvable." };

  const newStart = new Date(newStartAtISO);
  const newEnd = new Date(newStart);
  newEnd.setMinutes(newEnd.getMinutes() + durationMinutes);

  // Vérifie qu'aucun AUTRE rendez-vous ne chevauche ce nouveau créneau
  const { data: overlaps } = await supabase
    .from("appointments")
    .select("id")
    .neq("id", id)
    .in("status", ["confirmed", "pending"])
    .lt("start_at", newEnd.toISOString())
    .gt("end_at", newStart.toISOString());

  if (overlaps && overlaps.length > 0) {
    return { ok: false as const, error: "Ce nouveau créneau chevauche un autre rendez-vous." };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ start_at: newStart.toISOString(), end_at: newEnd.toISOString() })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function searchClients(query: string) {
  await requireAdminUser();
  if (query.trim().length < 2) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(8);
  return data ?? [];
}

export async function getSlotsForDateAdmin(serviceId: string, dateISO: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes, buffer_minutes")
    .eq("id", serviceId)
    .maybeSingle();
  if (!service) return [];
  const slots = await getAvailableSlots(dateISO, service);
  return slots.map((s) => s.toISOString());
}

export type ManualAppointmentInput = {
  serviceId: string;
  startAtISO: string;
  clientId?: string;
  newClient?: { firstName: string; lastName: string; email: string; phone: string };
  notes?: string;
};

export async function createManualAppointment(input: ManualAppointmentInput) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: service } = await supabase
    .from("services")
    .select("id, duration_minutes")
    .eq("id", input.serviceId)
    .maybeSingle();
  if (!service) return { ok: false as const, error: "Prestation introuvable." };

  const startAt = new Date(input.startAtISO);
  const endAt = new Date(startAt);
  endAt.setMinutes(endAt.getMinutes() + service.duration_minutes);

  const { data: overlaps } = await supabase
    .from("appointments")
    .select("id")
    .in("status", ["confirmed", "pending"])
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString());

  if (overlaps && overlaps.length > 0) {
    return { ok: false as const, error: "Ce créneau chevauche déjà un autre rendez-vous." };
  }

  let clientId = input.clientId;
  if (!clientId && input.newClient) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        first_name: input.newClient.firstName,
        last_name: input.newClient.lastName,
        email: input.newClient.email || null,
        phone: input.newClient.phone || null,
      })
      .select("id")
      .single();
    if (clientError || !newClient) return { ok: false as const, error: "Erreur lors de la création de la cliente." };
    clientId = newClient.id;
  }

  if (!clientId) return { ok: false as const, error: "Merci de choisir ou créer une cliente." };

  const { error } = await supabase.from("appointments").insert({
    client_id: clientId,
    service_id: service.id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    status: "confirmed",
    notes: input.notes ?? "",
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin");
  return { ok: true as const };
}
