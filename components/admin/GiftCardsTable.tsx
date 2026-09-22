"use client";

import { useState } from "react";
import { redeemGiftCardManually } from "@/app/actions/admin-gift-cards";

type GiftCard = {
  id: string;
  code: string;
  initial_amount: number;
  remaining_amount: number;
  buyer_name: string;
  buyer_email: string;
  recipient_name: string;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Paiement en attente",
  active: "Active",
  used: "Épuisée",
  expired: "Expirée",
};

export function GiftCardsTable({ initial }: { initial: GiftCard[] }) {
  const [cards, setCards] = useState<GiftCard[]>(initial);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  async function handleRedeem(card: GiftCard) {
    const amount = parseFloat(amounts[card.id] || "0");
    if (!amount || amount <= 0) return;
    const result = await redeemGiftCardManually(card.id, amount);
    if (result.ok) {
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, remaining_amount: result.newRemaining, status: result.newRemaining <= 0 ? "used" : "active" } : c))
      );
      setAmounts((prev) => ({ ...prev, [card.id]: "" }));
    }
  }

  if (cards.length === 0) {
    return <p className="text-sm text-ink-soft">Aucune carte cadeau pour l'instant.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.map((c) => (
        <div key={c.id} className="rounded-sm border border-line bg-surface p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <code className="font-medium">{c.code}</code>
            <span className="rounded-full bg-blush px-3 py-1 text-xs">{STATUS_LABELS[c.status] ?? c.status}</span>
          </div>
          <p className="mb-1 text-sm text-ink-soft">
            Achetée par {c.buyer_name} ({c.buyer_email}){c.recipient_name ? ` — pour ${c.recipient_name}` : ""}
          </p>
          <p className="mb-3 text-sm">
            Solde : <span className="font-serif italic text-accent">{c.remaining_amount} €</span> / {c.initial_amount} €
          </p>
          {c.status === "active" && c.remaining_amount > 0 && (
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={c.remaining_amount}
                step="0.5"
                placeholder="Montant à déduire (usage en personne)"
                value={amounts[c.id] || ""}
                onChange={(e) => setAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                className="flex-1 rounded-sm border border-line px-3 py-2 text-sm"
              />
              <button onClick={() => handleRedeem(c)} className="rounded-sm border border-line px-4 py-2 text-sm hover:border-accent hover:text-accent">
                Déduire
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
