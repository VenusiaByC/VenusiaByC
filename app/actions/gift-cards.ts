"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/settings";
import { generateGiftCardCode } from "@/lib/gift-card-code";

export type GiftCardPurchaseInput = {
  amount: number;
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
};

export async function createGiftCardCheckout(input: GiftCardPurchaseInput) {
  if (!input.amount || input.amount < 5) {
    return { ok: false as const, error: "Le montant minimum est de 5 €." };
  }
  if (!input.buyerName || !input.buyerEmail) {
    return { ok: false as const, error: "Merci de renseigner ton nom et ton e-mail." };
  }

  const settings = await getSiteSettings();
  if (!settings.site_url) {
    return { ok: false as const, error: "L'adresse du site n'est pas configurée (contacte-nous directement)." };
  }

  const supabase = createAdminClient();

  // Génère un code unique (quelques tentatives en cas de collision très improbable)
  let code = generateGiftCardCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase.from("gift_cards").select("id").eq("code", code).maybeSingle();
    if (!existing) break;
    code = generateGiftCardCode();
  }

  const { data: giftCard, error: insertError } = await supabase
    .from("gift_cards")
    .insert({
      code,
      initial_amount: input.amount,
      remaining_amount: input.amount,
      buyer_name: input.buyerName,
      buyer_email: input.buyerEmail,
      recipient_name: input.recipientName,
      recipient_email: input.recipientEmail,
      message: input.message,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !giftCard) {
    return { ok: false as const, error: "Erreur lors de la création de la carte cadeau." };
  }

  const base = settings.site_url.replace(/\/$/, "");
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.buyerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: `Carte cadeau ${settings.brand_name} — ${input.amount} €` },
          unit_amount: Math.round(input.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/carte-cadeau/merci`,
    cancel_url: `${base}/carte-cadeau`,
    metadata: {
      type: "gift_card",
      gift_card_id: giftCard.id,
    },
  });

  await supabase.from("gift_cards").update({ stripe_session_id: session.id }).eq("id", giftCard.id);

  return { ok: true as const, url: session.url! };
}
