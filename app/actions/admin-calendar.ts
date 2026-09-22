"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { addDaysToISO, parisWallTimeToUtc } from "@/lib/timezone";

export async function getWeekAppointments(mondayISO: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const weekStart = parisWallTimeToUtc(mondayISO, "00:00").toISOString();
  const weekEnd = parisWallTimeToUtc(addDaysToISO(mondayISO, 7), "00:00").toISOString();

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, status, client:clients(first_name, last_name), service:services(name)"
    )
    .neq("status", "cancelled")
    .gte("start_at", weekStart)
    .lt("start_at", weekEnd)
    .order("start_at");

  return data ?? [];
}

/** Détermine l'amplitude horaire à afficher dans la grille (du plus tôt
 * au plus tard configuré dans les horaires habituels), avec une marge et
 * un repli raisonnable si rien n'est encore configuré. */
export async function getCalendarBounds() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("business_hours")
    .select("start_time, end_time")
    .eq("is_closed", false);

  if (!data || data.length === 0) return { startHour: 8, endHour: 20 };

  const starts = data.map((r) => parseInt(r.start_time.slice(0, 2), 10));
  const ends = data.map((r) => parseInt(r.end_time.slice(0, 2), 10));
  const startHour = Math.max(0, Math.min(...starts) - 1);
  const endHour = Math.min(24, Math.max(...ends) + 1);
  return { startHour, endHour };
}
