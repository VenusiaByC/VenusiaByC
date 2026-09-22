"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/settings";

export async function validateGiftCardCode(code: string) {
  if (!code.trim()) return { valid: false as const, error: "Code manquant" };
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gift_cards")
    .select("id, remaining_amount, status")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!data) return { valid: false as const, error: "Code introuvable" };
  if (data.status !== "active") return { valid: false as const, error: "Cette carte n'est pas (ou plus) active" };
  if (data.remaining_amount <= 0) return { valid: false as const, error: "Cette carte n'a plus de solde" };

  return { valid: true as const, remaining: data.remaining_amount };
}

/**
 * Crée une session de paiement Stripe pour un rendez-vous déjà réservé.
 * Si une carte cadeau valide couvre tout le montant, aucun paiement Stripe
 * n'est nécessaire : le rendez-vous est marqué payé directement.
 */
export async function createAppointmentCheckout(appointmentId: string, giftCardCode?: string) {
  const supabase = createAdminClient();
  const settings = await getSiteSettings();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, manage_token, client:clients(email), service:services(name, price)")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment) return { ok: false as const, error: "Rendez-vous introuvable." };
  const service = (appointment as any).service;
  const client = (appointment as any).client;

  let amount = service.price;
  let giftCard: { id: string; remaining_amount: number } | null = null;
  let deduction = 0;

  if (giftCardCode) {
    const { data: gc } = await supabase
      .from("gift_cards")
      .select("id, remaining_amount, status")
      .eq("code", giftCardCode.trim().toUpperCase())
      .maybeSingle();
    if (gc && gc.status === "active" && gc.remaining_amount > 0) {
      giftCard = gc;
      deduction = Math.min(gc.remaining_amount, amount);
      amount -= deduction;
    }
  }

  if (!settings.site_url) {
    return { ok: false as const, error: "L'adresse du site n'est pas configurée (Admin → Paramètres)." };
  }
  const base = settings.site_url.replace(/\/$/, "");
  const returnUrl = `${base}/rdv/${appointment.manage_token}`;

  // Carte cadeau couvrant tout le montant : pas besoin de Stripe.
  if (amount <= 0 && giftCard) {
    await supabase
      .from("appointments")
      .update({ payment_status: "paid", paid_amount: service.price })
      .eq("id", appointmentId);
    await supabase
      .from("gift_cards")
      .update({
        remaining_amount: giftCard.remaining_amount - deduction,
        status: giftCard.remaining_amount - deduction <= 0 ? "used" : "active",
      })
      .eq("id", giftCard.id);
    return { ok: true as const, url: returnUrl, fullyCovered: true as const };
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: client?.email || undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: service.name },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?paid=1`,
    cancel_url: returnUrl,
    metadata: {
      type: "appointment",
      appointment_id: appointmentId,
      gift_card_id: giftCard?.id ?? "",
      gift_card_deduction: String(deduction),
    },
  });

  await supabase
    .from("appointments")
    .update({ payment_status: "pending", stripe_session_id: session.id })
    .eq("id", appointmentId);

  return { ok: true as const, url: session.url!, fullyCovered: false as const };
}
