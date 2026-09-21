"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { getEmailTemplate } from "@/lib/email/templates";

export async function getEmailTemplateAdmin(name: string) {
  await requireAdminUser();
  return getEmailTemplate(name);
}

export async function saveEmailTemplate(name: string, subject: string, body: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("email_templates")
    .upsert({ name, subject, body }, { onConflict: "name" });

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/emails");
  return { ok: true as const };
}
