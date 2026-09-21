import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientDetail } from "@/app/actions/admin-clients";
import { ClientForm } from "@/components/admin/ClientForm";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  cancelled: "Annulé",
  completed: "Terminé",
  no_show: "Absence",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const result = await getClientDetail(params.id);
  if (!result) notFound();
  const { client, appointments } = result;

  const now = Date.now();
  const upcoming = appointments.filter((a: any) => new Date(a.start_at).getTime() >= now);
  const past = appointments.filter((a: any) => new Date(a.start_at).getTime() < now);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">
        {client.first_name} {client.last_name}
      </h1>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-medium">Informations</h2>
          <ClientForm initial={client} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium">Prochains rendez-vous</h2>
          {upcoming.length === 0 ? (
            <p className="mb-8 text-sm text-ink-soft">Aucun rendez-vous à venir.</p>
          ) : (
            <div className="mb-8 flex flex-col gap-2">
              {upcoming.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/admin/rendez-vous/${a.id}`}
                  className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm transition hover:border-ink-soft"
                >
                  <span>
                    {formatParisDate(new Date(a.start_at), { day: "numeric", month: "short" })} à{" "}
                    {formatParisTime(new Date(a.start_at))} — {a.service?.name}
                  </span>
                  <span className="text-ink-soft">{STATUS_LABELS[a.status] ?? a.status}</span>
                </Link>
              ))}
            </div>
          )}

          <h2 className="mb-4 text-lg font-medium">Historique</h2>
          {past.length === 0 ? (
            <p className="text-sm text-ink-soft">Aucun rendez-vous passé.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {past.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/admin/rendez-vous/${a.id}`}
                  className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm text-ink-soft transition hover:border-ink-soft"
                >
                  <span>
                    {formatParisDate(new Date(a.start_at), { day: "numeric", month: "short", year: "numeric" })} — {a.service?.name}
                  </span>
                  <span>{STATUS_LABELS[a.status] ?? a.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
