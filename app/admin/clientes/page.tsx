import Link from "next/link";
import { listClients } from "@/app/actions/admin-clients";

export default async function ClientesPage({ searchParams }: { searchParams: { q?: string } }) {
  const clients = await listClients(searchParams.q);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl italic">Clientes</h1>
        <Link
          href="/admin/clientes/nouveau"
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          + Ajouter une cliente
        </Link>
      </div>

      <form className="mb-6 flex items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Rechercher par nom, téléphone ou e-mail..."
          className="w-full max-w-sm rounded-sm border border-line bg-surface px-4 py-2.5 text-sm"
        />
        <button className="rounded-sm border border-line px-4 py-2.5 text-sm">Rechercher</button>
      </form>

      {clients.length === 0 ? (
        <p className="text-ink-soft">Aucune cliente pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${c.id}`}
              className="flex items-center justify-between rounded-sm border border-line bg-surface px-5 py-4 transition hover:border-ink-soft"
            >
              <div className="font-medium">{c.first_name} {c.last_name}</div>
              <div className="text-sm text-ink-soft">{c.phone || c.email || "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
