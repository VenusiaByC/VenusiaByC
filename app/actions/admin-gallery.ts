"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export async function listGalleryPhotosAdmin() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("gallery_photos").select("*").order("display_order");
  return data ?? [];
}

export async function addGalleryPhoto(imageUrl: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("gallery_photos")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (existing?.display_order ?? -1) + 1;

  const { error } = await supabase.from("gallery_photos").insert({ image_url: imageUrl, display_order: nextOrder });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateGalleryPhoto(id: string, caption: string, displayOrder: number) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("gallery_photos")
    .update({ caption, display_order: displayOrder })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteGalleryPhoto(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  revalidatePath("/");
  return { ok: true as const };
}
