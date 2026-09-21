import { listBlockedSlots } from "@/app/actions/admin-blocked";
import { BlockedSlotsManager } from "@/components/admin/BlockedSlotsManager";

export default async function IndisponibilitesPage() {
  const slots = await listBlockedSlots();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Indisponibilités</h1>
      <p className="mb-8 text-ink-soft">
        Bloque des congés, une période, ou juste quelques heures — ces créneaux disparaîtront
        automatiquement du calendrier de réservation.
      </p>
      <BlockedSlotsManager initial={slots} />
    </div>
  );
}
