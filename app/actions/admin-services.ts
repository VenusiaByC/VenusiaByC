"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export async function listServicesAdmin() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getServiceAdmin(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return data;
}

export type ServiceInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration_minutes: number;
  buffer_minutes: number;
  display_order: number;
  active: boolean;
  photos: string[];
};

export async function saveService(input: ServiceInput) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const payload = {
    name: input.name,
    description: input.description,
    category: input.category,
    price: input.price,
    duration_minutes: input.duration_minutes,
    buffer_minutes: input.buffer_minutes,
    display_order: input.display_order,
    active: input.active,
    photos: input.photos,
  };

  if (input.id) {
    const { error } = await supabase.from("services").update(payload).eq("id", input.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("services").insert(payload);
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/prestations");
  revalidatePath("/");
  revalidatePath("/reserver");
  return { ok: true as const };
}

export async function deleteService(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/prestations");
  revalidatePath("/");
  revalidatePath("/reserver");
  return { ok: true as const };
}
