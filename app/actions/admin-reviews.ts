"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export async function listReviewsAdmin() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function setReviewPublished(id: string, published: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").update({ published }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/avis");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteReview(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/avis");
  revalidatePath("/");
  return { ok: true as const };
}
