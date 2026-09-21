import { createAdminClient } from "@/lib/supabase/admin";
import { todayISOInBusinessTZ, formatParisDate, formatParisTime } from "@/lib/timezone";

async function getDashboardData() {
  const supabase = createAdminClient();
  const todayISO = todayISOInBusinessTZ();
  const todayStart = `${todayISO}T00:00:00`;
  const todayEnd = `${todayISO}T23:59:59`;

  const [{ data: todayAppts }, { data: upcoming }, { count: clientCount }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, start_at, status, client:clients(first_name, last_name), service:services(name, price)")
      .gte("start_at", todayStart)
      .lte("start_at", todayEnd)
      .neq("status", "cancelled")
      .order("start_at"),
    supabase
      .from("appointments")
      .select("id, start_at, client:clients(first_name, last_name), service:services(name)")
      .gt("start_at", todayEnd)
      .neq("status", "cancelled")
      .order("start_at")
      .limit(5),
    supabase.from("clients").select("id", { count: "exact", head: true }),
  ]);

  const revenueToday = (todayAppts ?? []).reduce((sum, a: any) => sum + (a.service?.price ?? 0), 0);

  return {
    todayAppts: todayAppts ?? [],
    upcoming: upcoming ?? [],
    clientCount: clientCount ?? 0,
    revenueToday,
  };
}

export default async function AdminDashboard() {
  const { todayAppts, upcoming, clientCount, revenueToday } = await getDashboardData();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl italic">Bonjour 👋</h1>
      <p className="mb-8 text-ink-soft">
        {todayAppts.length} rendez-vous aujourd'hui
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-line bg-surface p-5">
          <div className="text-sm text-ink-soft">Rendez-vous aujourd'hui</div>
          <div className="mt-1 font-serif text-3xl italic text-accent">{todayAppts.length}</div>
        </div>
        <div className="rounded-sm border border-line bg-surface p-5">
          <div className="text-sm text-ink-soft">Chiffre d'affaires prévu</div>
          <div className="mt-1 font-serif text-3xl italic text-accent">{revenueToday.toFixed(0)} €</div>
        </div>
        <div className="rounded-sm border border-line bg-surface p-5">
          <div className="text-sm text-ink-soft">Clientes enregistrées</div>
          <div className="mt-1 font-serif text-3xl italic text-accent">{clientCount}</div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-serif text-xl italic">Aujourd'hui</h2>
          {todayAppts.length === 0 ? (
            <p className="text-sm text-ink-soft">Aucun rendez-vous aujourd'hui.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todayAppts.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm">
                  <span>
                    {formatParisTime(new Date(a.start_at))} —{" "}
                    {a.client?.first_name} {a.client?.last_name}
                  </span>
                  <span className="text-ink-soft">{a.service?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-4 font-serif text-xl italic">Prochains rendez-vous</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-soft">Rien de prévu pour l'instant.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm">
                  <span>
                    {formatParisDate(new Date(a.start_at), { day: "numeric", month: "short" })} —{" "}
                    {a.client?.first_name} {a.client?.last_name}
                  </span>
                  <span className="text-ink-soft">{a.service?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
