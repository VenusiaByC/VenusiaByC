"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { getSmsTemplate } from "@/lib/sms/templates";

export async function getSmsTemplateAdmin(name: string) {
  await requireAdminUser();
  return getSmsTemplate(name);
}

export async function saveSmsTemplate(name: string, body: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("sms_templates").upsert({ name, body }, { onConflict: "name" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/sms");
  return { ok: true as const };
}
