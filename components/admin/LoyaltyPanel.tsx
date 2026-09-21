"use client";

import { useState } from "react";
import { adjustClientLoyaltyPoints } from "@/app/actions/admin-clients";

export function LoyaltyPanel({
  clientId,
  initialPoints,
  threshold,
  rewardDescription,
}: {
  clientId: string;
  initialPoints: number;
  threshold: number;
  rewardDescription: string;
}) {
  const [points, setPoints] = useState(initialPoints);
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function adjust(delta: number) {
    setSaving(true);
    const result = await adjustClientLoyaltyPoints(clientId, delta, reason);
    setSaving(false);
    if (result.ok) {
      setPoints(result.newTotal);
      setReason("");
    }
  }

  const progress = threshold > 0 ? Math.min(100, (points / threshold) * 100) : 0;
  const eligible = threshold > 0 && points >= threshold;

  return (
    <div className="rounded-sm border border-line bg-surface p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-serif text-2xl italic text-accent">{points} pts</span>
        {eligible && <span className="text-xs text-accent">Récompense disponible !</span>}
      </div>

      {threshold > 0 && (
        <div className="mb-4">
          <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-blush">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-ink-soft">
            {points} / {threshold} points — {rewardDescription}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          className="w-16 rounded-sm border border-line px-2 py-1.5 text-sm"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif (optionnel)"
          className="flex-1 rounded-sm border border-line px-2 py-1.5 text-sm"
        />
        <button
          onClick={() => adjust(amount)}
          disabled={saving}
          className="rounded-sm border border-line px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
        >
          + Ajouter
        </button>
        <button
          onClick={() => adjust(-amount)}
          disabled={saving}
          className="rounded-sm border border-line px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
        >
          − Retirer
        </button>
      </div>
    </div>
  );
}
