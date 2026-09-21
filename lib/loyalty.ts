import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/settings";

/**
 * Attribue les points de fidélité pour un rendez-vous marqué "terminé",
 * une seule fois par rendez-vous (protégé par la colonne
 * appointments.loyalty_awarded).
 */
export async function awardLoyaltyForAppointment(appointmentId: string) {
  const settings = await getSiteSettings();
  if (settings.loyalty_enabled !== "true") return;

  const points = parseInt(settings.loyalty_points_per_visit, 10) || 0;
  if (points <= 0) return;

  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, client_id, loyalty_awarded")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment || appointment.loyalty_awarded) return;

  await adjustLoyaltyPoints(appointment.client_id, points, "Rendez-vous terminé", appointmentId);

  await supabase.from("appointments").update({ loyalty_awarded: true }).eq("id", appointmentId);
}

/** Ajoute (ou retire, avec un nombre négatif) des points à une cliente,
 * avec une trace dans l'historique. Utilisé pour l'attribution automatique
 * comme pour les ajustements manuels depuis l'admin. */
export async function adjustLoyaltyPoints(
  clientId: string,
  delta: number,
  reason: string,
  appointmentId?: string
) {
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("loyalty_points")
    .eq("id", clientId)
    .maybeSingle();

  const newTotal = Math.max(0, (client?.loyalty_points ?? 0) + delta);

  await supabase.from("clients").update({ loyalty_points: newTotal }).eq("id", clientId);
  await supabase.from("loyalty_ledger").insert({
    client_id: clientId,
    appointment_id: appointmentId ?? null,
    points_delta: delta,
    reason,
  });

  return newTotal;
}
