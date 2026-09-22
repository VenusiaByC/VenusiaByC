import { NextResponse, type NextRequest } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGiftCardEmail } from "@/lib/email/confirmation";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const supabase = createAdminClient();
    const metadata = session.metadata ?? {};

    if (metadata.type === "appointment" && metadata.appointment_id) {
      await supabase
        .from("appointments")
        .update({ payment_status: "paid", paid_amount: (session.amount_total ?? 0) / 100 })
        .eq("id", metadata.appointment_id);

      if (metadata.gift_card_id) {
        const { data: giftCard } = await supabase
          .from("gift_cards")
          .select("remaining_amount")
          .eq("id", metadata.gift_card_id)
          .maybeSingle();
        if (giftCard) {
          const deduction = parseFloat(metadata.gift_card_deduction || "0");
          const newRemaining = Math.max(0, giftCard.remaining_amount - deduction);
          await supabase
            .from("gift_cards")
            .update({ remaining_amount: newRemaining, status: newRemaining <= 0 ? "used" : "active" })
            .eq("id", metadata.gift_card_id);
        }
      }
    }

    if (metadata.type === "gift_card" && metadata.gift_card_id) {
      await supabase
        .from("gift_cards")
        .update({ status: "active" })
        .eq("id", metadata.gift_card_id);

      try {
        await sendGiftCardEmail(metadata.gift_card_id);
      } catch {
        // jamais bloquant pour le webhook
      }
    }
  }

  return NextResponse.json({ received: true });
}
