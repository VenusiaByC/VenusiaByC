import { getWeeklyHours, listExceptions } from "@/app/actions/admin-hours";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { ExceptionsPanel } from "@/components/admin/ExceptionsPanel";

export default async function HorairesPage() {
  const [week, exceptions] = await Promise.all([getWeeklyHours(), listExceptions()]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">Horaires</h1>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Horaires habituels</h2>
        <HoursEditor initial={week} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Horaires exceptionnels</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Remplace les horaires habituels pour une date précise (ex : ouverture tardive, fermeture ponctuelle).
          Pour bloquer plusieurs jours d'affilée (congés), utilise plutôt la section "Indisponibilités".
        </p>
        <ExceptionsPanel initial={exceptions} />
      </section>
    </div>
  );
}
