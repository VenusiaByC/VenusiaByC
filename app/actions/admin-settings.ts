"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { getSiteSettings, type SiteSettings } from "@/lib/settings";
import { regenerateIcsToken } from "@/lib/ics-token";

export async function getSettingsAdmin(): Promise<SiteSettings> {
  await requireAdminUser();
  return getSiteSettings();
}

export async function saveSettings(settings: SiteSettings) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value === null ? "" : String(value),
  }));

  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/reserver");
  revalidatePath("/admin/parametres");
  return { ok: true as const };
}

export async function regenerateCalendarToken() {
  await requireAdminUser();
  const token = await regenerateIcsToken();
  revalidatePath("/admin/parametres");
  return { ok: true as const, token };
}
