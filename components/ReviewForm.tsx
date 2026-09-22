"use client";

import { useState } from "react";
import { submitReview } from "@/app/actions/self-service";

export function ReviewForm({ token }: { token: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const result = await submitReview(token, rating, comment);
    setSaving(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error);
    }
  }

  if (done) {
    return (
      <div className="mt-6 rounded-sm border border-line bg-blush p-5 text-sm">
        Merci beaucoup pour ton avis ! 💛
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-sm border border-line bg-surface p-5">
      <h3 className="mb-3 font-serif text-xl italic">Comment s'est passé ton rendez-vous ?</h3>
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-gold" : "text-line"}`}
            aria-label={`${n} étoiles`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ton commentaire (optionnel)"
        rows={3}
        className="mb-3 w-full rounded-sm border border-line px-4 py-2.5 text-sm"
      />
      {error && <p className="mb-3 text-sm text-accent">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-sm bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {saving ? "Envoi…" : "Envoyer mon avis"}
      </button>
    </div>
  );
}
