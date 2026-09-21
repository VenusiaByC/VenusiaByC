import Link from "next/link";
import { listServicesAdmin } from "@/app/actions/admin-services";

export default async function PrestationsPage() {
  const services = await listServicesAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl italic">Prestations</h1>
        <Link
          href="/admin/prestations/nouveau"
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          + Ajouter une prestation
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="text-ink-soft">Aucune prestation pour l'instant. Ajoute la première !</p>
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/admin/prestations/${s.id}`}
              className="flex items-center justify-between rounded-sm border border-line bg-surface px-5 py-4 transition hover:border-ink-soft"
            >
              <div className="flex items-center gap-4">
                {s.photos?.[0] && (
                  <img src={s.photos[0]} alt="" className="h-12 w-12 rounded-sm object-cover" />
                )}
                <div>
                  <div className="font-medium">
                    {s.name}
                    {!s.active && (
                      <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-xs text-ink-soft">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink-soft">{s.duration_minutes} min</div>
                </div>
              </div>
              <div className="font-serif italic text-accent">{s.price} €</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
