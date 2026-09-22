"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export async function listGiftCardsAdmin() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("gift_cards").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

/** Déduit manuellement un montant (utilisation en personne, sans passer
 * par le paiement en ligne d'un rendez-vous). */
export async function redeemGiftCardManually(id: string, amount: number) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: giftCard } = await supabase.from("gift_cards").select("remaining_amount").eq("id", id).maybeSingle();
  if (!giftCard) return { ok: false as const, error: "Carte cadeau introuvable." };

  const newRemaining = Math.max(0, giftCard.remaining_amount - amount);
  const { error } = await supabase
    .from("gift_cards")
    .update({ remaining_amount: newRemaining, status: newRemaining <= 0 ? "used" : "active" })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/cartes-cadeaux");
  return { ok: true as const, newRemaining };
}
