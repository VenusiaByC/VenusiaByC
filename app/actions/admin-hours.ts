"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export type HourRange = { start_time: string; end_time: string };
export type DayHours = { day_of_week: number; is_closed: boolean; ranges: HourRange[] };

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export { DAY_LABELS };

export async function getWeeklyHours(): Promise<DayHours[]> {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("business_hours").select("*").order("start_time");

  const week: DayHours[] = Array.from({ length: 7 }, (_, day_of_week) => ({
    day_of_week,
    is_closed: true,
    ranges: [],
  }));

  for (const row of data ?? []) {
    const day = week[row.day_of_week];
    if (row.is_closed) {
      day.is_closed = true;
    } else {
      day.is_closed = false;
      day.ranges.push({ start_time: row.start_time, end_time: row.end_time });
    }
  }

  return week;
}

export async function saveWeeklyHours(week: DayHours[]) {
  await requireAdminUser();
  const supabase = createAdminClient();

  // Remplace toutes les lignes d'un coup : plus simple et plus sûr que
  // d'essayer de calculer un diff précis.
  await supabase.from("business_hours").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const rows = week.flatMap((day) => {
    if (day.is_closed || day.ranges.length === 0) {
      return [{ day_of_week: day.day_of_week, start_time: "00:00", end_time: "00:00", is_closed: true }];
    }
    return day.ranges.map((r) => ({
      day_of_week: day.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
      is_closed: false,
    }));
  });

  const { error } = await supabase.from("business_hours").insert(rows);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/horaires");
  revalidatePath("/reserver");
  return { ok: true as const };
}

export async function listExceptions() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("schedule_exceptions")
    .select("*")
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date");
  return data ?? [];
}

export async function addException(input: {
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
}) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("schedule_exceptions").upsert(
    {
      date: input.date,
      is_closed: input.is_closed,
      start_time: input.is_closed ? null : input.start_time,
      end_time: input.is_closed ? null : input.end_time,
      reason: input.reason,
    },
    { onConflict: "date" }
  );
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/horaires");
  revalidatePath("/reserver");
  return { ok: true as const };
}

export async function deleteException(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("schedule_exceptions").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/horaires");
  revalidatePath("/reserver");
  return { ok: true as const };
}
