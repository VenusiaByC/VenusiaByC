import Link from "next/link";
import { formatParisTime } from "@/lib/timezone";
import { addDaysToISO } from "@/lib/timezone";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-accent/85 text-white",
  pending: "bg-gold/70 text-ink",
  completed: "bg-line text-ink-soft",
  no_show: "bg-accent/30 text-ink",
};

type Appointment = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  client: { first_name: string; last_name: string } | null;
  service: { name: string } | null;
};

export function CalendarWeekView({
  mondayISO,
  appointments,
  startHour,
  endHour,
}: {
  mondayISO: string;
  appointments: Appointment[];
  startHour: number;
  endHour: number;
}) {
  const PX_PER_HOUR = 56;
  const totalHours = endHour - startHour;
  const gridHeight = totalHours * PX_PER_HOUR;

  const days = Array.from({ length: 7 }, (_, i) => addDaysToISO(mondayISO, i));

  function appointmentsForDay(dateISO: string) {
    return appointments.filter((a) => {
      // Comparaison sur la date affichée en heure de Paris.
      const local = new Date(a.start_at).toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
      return local === dateISO;
    });
  }

  function positionStyle(a: Appointment) {
    const start = new Date(a.start_at);
    const end = new Date(a.end_at);
    const startMinutesFromParisMidnight =
      Number(start.toLocaleString("en-US", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false })) * 60 +
      Number(start.toLocaleString("en-US", { timeZone: "Europe/Paris", minute: "2-digit" }));
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;

    const top = ((startMinutesFromParisMidnight - startHour * 60) / 60) * PX_PER_HOUR;
    const height = Math.max(20, (durationMinutes / 60) * PX_PER_HOUR - 2);
    return { top: `${top}px`, height: `${height}px` };
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[900px]">
        <div className="w-14 shrink-0">
          <div className="h-10" />
          <div style={{ height: gridHeight }} className="relative">
            {Array.from({ length: totalHours + 1 }, (_, i) => (
              <div
                key={i}
                style={{ top: `${i * PX_PER_HOUR}px` }}
                className="absolute -translate-y-2 text-xs text-ink-soft"
              >
                {startHour + i}h
              </div>
            ))}
          </div>
        </div>

        {days.map((dateISO, i) => (
          <div key={dateISO} className="flex-1 border-l border-line">
            <div className="h-10 border-b border-line px-2 py-2 text-center text-sm font-medium">
              {DAY_LABELS[i]} {dateISO.slice(8, 10)}
            </div>
            <div style={{ height: gridHeight }} className="relative">
              {Array.from({ length: totalHours }, (_, h) => (
                <div
                  key={h}
                  style={{ top: `${h * PX_PER_HOUR}px`, height: `${PX_PER_HOUR}px` }}
                  className="absolute w-full border-b border-line/50"
                />
              ))}
              {appointmentsForDay(dateISO).map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/rendez-vous/${a.id}`}
                  style={positionStyle(a)}
                  className={`absolute left-0.5 right-0.5 overflow-hidden rounded-sm px-1.5 py-1 text-[11px] leading-tight transition hover:opacity-90 ${STATUS_COLORS[a.status] ?? "bg-blush text-ink"}`}
                >
                  <div className="font-medium">{formatParisTime(new Date(a.start_at))}</div>
                  <div className="truncate">
                    {a.client?.first_name} {a.client?.last_name}
                  </div>
                  <div className="truncate opacity-80">{a.service?.name}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
