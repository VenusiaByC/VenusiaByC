"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { parisWallTimeToUtc } from "@/lib/timezone";

export async function listBlockedSlots() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blocked_slots")
    .select("*")
    .gte("end_datetime", new Date().toISOString())
    .order("start_datetime");
  return data ?? [];
}

export type AddBlockedSlotInput =
  | { mode: "days"; startDate: string; endDate: string; reason: string }
  | { mode: "hours"; date: string; startTime: string; endTime: string; reason: string };

export async function addBlockedSlot(input: AddBlockedSlotInput) {
  await requireAdminUser();
  const supabase = createAdminClient();

  let startDatetime: Date;
  let endDatetime: Date;

  if (input.mode === "days") {
    startDatetime = parisWallTimeToUtc(input.startDate, "00:00");
    endDatetime = parisWallTimeToUtc(input.endDate, "23:59");
  } else {
    startDatetime = parisWallTimeToUtc(input.date, input.startTime);
    endDatetime = parisWallTimeToUtc(input.date, input.endTime);
  }

  if (endDatetime <= startDatetime) {
    return { ok: false as const, error: "La fin doit être après le début." };
  }

  const { error } = await supabase.from("blocked_slots").insert({
    start_datetime: startDatetime.toISOString(),
    end_datetime: endDatetime.toISOString(),
    reason: input.reason,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/indisponibilites");
  revalidatePath("/reserver");
  return { ok: true as const };
}

export async function deleteBlockedSlot(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/indisponibilites");
  revalidatePath("/reserver");
  return { ok: true as const };
}
