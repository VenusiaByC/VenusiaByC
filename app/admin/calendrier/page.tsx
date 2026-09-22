import Link from "next/link";
import { getWeekAppointments, getCalendarBounds } from "@/app/actions/admin-calendar";
import { CalendarWeekView } from "@/components/admin/CalendarWeekView";
import { todayISOInBusinessTZ, getMondayOfWeek, addDaysToISO } from "@/lib/timezone";

export default async function CalendrierPage({ searchParams }: { searchParams: { week?: string } }) {
  const mondayISO = searchParams.week
    ? getMondayOfWeek(searchParams.week)
    : getMondayOfWeek(todayISOInBusinessTZ());

  const [appointments, bounds] = await Promise.all([
    getWeekAppointments(mondayISO),
    getCalendarBounds(),
  ]);

  const prevWeek = addDaysToISO(mondayISO, -7);
  const nextWeek = addDaysToISO(mondayISO, 7);
  const sundayISO = addDaysToISO(mondayISO, 6);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl italic">
          Calendrier — {mondayISO.slice(8, 10)}/{mondayISO.slice(5, 7)} au {sundayISO.slice(8, 10)}/{sundayISO.slice(5, 7)}
        </h1>
        <div className="flex items-center gap-2">
          <Link href={`/admin/calendrier?week=${prevWeek}`} className="rounded-sm border border-line px-4 py-2 text-sm hover:border-ink-soft">
            ← Semaine précédente
          </Link>
          <Link href="/admin/calendrier" className="rounded-sm border border-line px-4 py-2 text-sm hover:border-ink-soft">
            Aujourd'hui
          </Link>
          <Link href={`/admin/calendrier?week=${nextWeek}`} className="rounded-sm border border-line px-4 py-2 text-sm hover:border-ink-soft">
            Semaine suivante →
          </Link>
          <Link href="/admin/rendez-vous" className="ml-2 text-sm text-ink-soft underline">
            Vue liste
          </Link>
        </div>
      </div>

      <CalendarWeekView
        mondayISO={mondayISO}
        appointments={appointments as any}
        startHour={bounds.startHour}
        endHour={bounds.endHour}
      />
    </div>
  );
}
