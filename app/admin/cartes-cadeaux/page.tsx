import { listGiftCardsAdmin } from "@/app/actions/admin-gift-cards";
import { GiftCardsTable } from "@/components/admin/GiftCardsTable";

export default async function CartesCadeauxPage() {
  const cards = await listGiftCardsAdmin();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Cartes cadeaux</h1>
      <p className="mb-8 text-ink-soft">
        Achetées via le site. Utilise "Déduire" quand une cliente utilise sa carte en personne
        (le paiement en ligne d'un rendez-vous la déduit automatiquement).
      </p>
      <GiftCardsTable initial={cards} />
    </div>
  );
}
