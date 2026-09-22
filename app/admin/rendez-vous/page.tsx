import Link from "next/link";
import { listAppointments } from "@/app/actions/admin-appointments";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  cancelled: "Annulé",
  completed: "Terminé",
  no_show: "Absence",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blush text-ink",
  pending: "bg-gold/20 text-ink",
  cancelled: "bg-line text-ink-soft",
  completed: "bg-line text-ink-soft",
  no_show: "bg-accent/15 text-accent",
};

export default async function RendezVousPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const appointments = await listAppointments(searchParams.date);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl italic">Rendez-vous</h1>
        <Link
          href="/admin/rendez-vous/nouveau"
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          + Nouveau rendez-vous
        </Link>
      </div>

      <div className="mb-4">
        <Link href="/admin/calendrier" className="text-sm text-ink-soft underline">
          Voir en calendrier →
        </Link>
      </div>

      <form className="mb-6 flex items-center gap-3">
        <label className="text-sm text-ink-soft">Filtrer par date :</label>
        <input
          type="date"
          name="date"
          defaultValue={searchParams.date ?? ""}
          className="rounded-sm border border-line px-3 py-2 text-sm"
        />
        <button className="rounded-sm border border-line px-4 py-2 text-sm">Filtrer</button>
        {searchParams.date && (
          <Link href="/admin/rendez-vous" className="text-sm text-ink-soft underline">
            Voir tous les prochains
          </Link>
        )}
      </form>

      {appointments.length === 0 ? (
        <p className="text-ink-soft">Aucun rendez-vous à afficher.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {appointments.map((a: any) => (
            <Link
              key={a.id}
              href={`/admin/rendez-vous/${a.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-5 py-4 transition hover:border-ink-soft"
            >
              <div>
                <div className="font-medium">
                  {a.client?.first_name} {a.client?.last_name}
                </div>
                <div className="text-sm text-ink-soft">
                  {formatParisDate(new Date(a.start_at), { weekday: "short", day: "numeric", month: "short" })} à{" "}
                  {formatParisTime(new Date(a.start_at))} — {a.service?.name}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-accent">{a.service?.price} €</span>
                <span className={`rounded-full px-3 py-1 text-xs ${STATUS_COLORS[a.status] ?? ""}`}>
                  {STATUS_LABELS[a.status] ?? a.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
