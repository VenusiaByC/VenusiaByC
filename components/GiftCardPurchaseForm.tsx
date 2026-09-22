"use client";

import { useState } from "react";
import { createGiftCardCheckout } from "@/app/actions/gift-cards";

const PRESET_AMOUNTS = [30, 50, 80, 120];

export function GiftCardPurchaseForm() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const result = await createGiftCardCheckout({
      amount: finalAmount,
      buyerName,
      buyerEmail,
      recipientName,
      recipientEmail,
      message,
    });
    setSaving(false);
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-4 font-serif text-2xl italic">1. Choisis le montant</h2>
      <div className="mb-3 grid grid-cols-4 gap-2">
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => { setAmount(a); setCustomAmount(""); }}
            className={`rounded-sm border px-3 py-3 text-sm ${
              !customAmount && amount === a ? "border-accent bg-blush" : "border-line"
            }`}
          >
            {a} €
          </button>
        ))}
      </div>
      <input
        type="number"
        min="5"
        placeholder="Autre montant (€)"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        className="mb-8 w-full rounded-sm border border-line bg-surface px-4 py-2.5 text-sm"
      />

      <h2 className="mb-4 font-serif text-2xl italic">2. Tes coordonnées</h2>
      <div className="mb-8 grid gap-3">
        <input placeholder="Ton prénom et nom" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
        <input placeholder="Ton e-mail" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
      </div>

      <h2 className="mb-4 font-serif text-2xl italic">3. Pour qui ? (optionnel)</h2>
      <div className="mb-8 grid gap-3">
        <input placeholder="Nom de la destinataire" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
        <input placeholder="E-mail de la destinataire" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
        <textarea placeholder="Petit message (optionnel)" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
      </div>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving || finalAmount < 5 || !buyerName || !buyerEmail}
        className="w-full rounded-sm bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {saving ? "…" : `Payer ${finalAmount || 0} €`}
      </button>
    </div>
  );
}
