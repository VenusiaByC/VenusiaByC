import { listReviewsAdmin } from "@/app/actions/admin-reviews";
import { ReviewsModeration } from "@/components/admin/ReviewsModeration";

export default async function AvisPage() {
  const reviews = await listReviewsAdmin();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Avis clients</h1>
      <p className="mb-8 text-ink-soft">
        Les clientes peuvent laisser un avis après un rendez-vous terminé, via leur lien de gestion.
        Publie ceux que tu veux afficher sur le site.
      </p>
      <ReviewsModeration initial={reviews} />
    </div>
  );
}
