"use client";

import { useState } from "react";
import { setReviewPublished, deleteReview } from "@/app/actions/admin-reviews";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  published: boolean;
  created_at: string;
};

export function ReviewsModeration({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);

  async function togglePublish(review: Review) {
    const next = !review.published;
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, published: next } : r)));
    await setReviewPublished(review.id, next);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await deleteReview(id);
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-ink-soft">Aucun avis pour l'instant.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-sm border border-line bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="font-medium">{r.author_name}</span>
              <span className="ml-2 text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs ${r.published ? "bg-blush text-ink" : "bg-line text-ink-soft"}`}
            >
              {r.published ? "Publié" : "En attente"}
            </span>
          </div>
          {r.comment && <p className="mb-3 text-sm text-ink-soft">{r.comment}</p>}
          <div className="flex gap-3 text-sm">
            <button onClick={() => togglePublish(r)} className="text-accent underline">
              {r.published ? "Dépublier" : "Publier"}
            </button>
            <button onClick={() => handleDelete(r.id)} className="text-ink-soft underline">
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
