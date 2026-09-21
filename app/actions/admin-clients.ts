"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export async function listClients(query?: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  let q = supabase
    .from("clients")
    .select("id, first_name, last_name, phone, email, created_at")
    .order("created_at", { ascending: false });

  if (query && query.trim().length >= 2) {
    q = q.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`
    );
  }

  const { data } = await q;
  return data ?? [];
}

export async function getClientDetail(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: client }, { data: appointments }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("id, start_at, status, service:services(name, price)")
      .eq("client_id", id)
      .order("start_at", { ascending: false }),
  ]);

  if (!client) return null;
  return { client, appointments: appointments ?? [] };
}

export type ClientInput = {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  internal_notes: string;
};

export async function saveClient(input: ClientInput) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const payload = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email || null,
    phone: input.phone || null,
    address: input.address,
    internal_notes: input.internal_notes,
  };

  if (input.id) {
    const { error } = await supabase.from("clients").update(payload).eq("id", input.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("clients").insert(payload);
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/clientes");
  return { ok: true as const };
}

export async function deleteClient(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  // Attention : supprime aussi tous les rendez-vous liés (voir schema.sql,
  // "on delete cascade").
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/clientes");
  return { ok: true as const };
}
