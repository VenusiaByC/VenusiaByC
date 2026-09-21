import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Moteur de disponibilité.
 *
 * Principe : on part des horaires d'ouverture du jour (habituels, ou
 * exceptionnels s'il y en a un pour cette date précise), on retire les
 * périodes bloquées (congés/indispo) et les rendez-vous déjà pris (en
 * ajoutant le temps de battement de leur prestation), puis on propose des
 * créneaux de départ possibles, par pas de 15 minutes, uniquement là où la
 * prestation demandée (durée + battement) tient entièrement.
 *
 * Simplification actuelle : les calculs se font en heure serveur. Le
 * déploiement (Vercel) doit être configuré en Europe/Paris pour que les
 * horaires affichés correspondent à l'heure réelle du salon — voir README.
 */

const SLOT_STEP_MINUTES = 15;

type Interval = { start: Date; end: Date };

function toDateTime(dateISO: string, time: string): Date {
  // dateISO: "2026-10-15", time: "09:00:00" ou "09:00"
  return new Date(`${dateISO}T${time.length === 5 ? time + ":00" : time}`);
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Retire les intervalles "busy" d'une liste d'intervalles "libres". */
function subtractIntervals(free: Interval[], busy: Interval[]): Interval[] {
  let result = free;
  for (const b of busy) {
    const next: Interval[] = [];
    for (const f of result) {
      if (!overlaps(f, b)) {
        next.push(f);
        continue;
      }
      if (b.start > f.start) next.push({ start: f.start, end: new Date(Math.min(b.start.getTime(), f.end.getTime())) });
      if (b.end < f.end) next.push({ start: new Date(Math.max(b.end.getTime(), f.start.getTime())), end: f.end });
    }
    result = next.filter((iv) => iv.start < iv.end);
  }
  return result;
}

async function getWorkingWindows(dateISO: string): Promise<Interval[]> {
  const supabase = createAdminClient();

  // 1. Y a-t-il un horaire exceptionnel pour cette date précise ?
  const { data: exception } = await supabase
    .from("schedule_exceptions")
    .select("*")
    .eq("date", dateISO)
    .maybeSingle();

  if (exception) {
    if (exception.is_closed || !exception.start_time || !exception.end_time) return [];
    return [{ start: toDateTime(dateISO, exception.start_time), end: toDateTime(dateISO, exception.end_time) }];
  }

  // 2. Sinon, horaires habituels du jour de la semaine
  const dayOfWeek = new Date(`${dateISO}T00:00:00`).getDay();
  const { data: hours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_closed", false);

  return (hours ?? []).map((h) => ({
    start: toDateTime(dateISO, h.start_time),
    end: toDateTime(dateISO, h.end_time),
  }));
}

async function getBusyIntervals(dateISO: string): Promise<Interval[]> {
  const supabase = createAdminClient();
  const dayStart = toDateTime(dateISO, "00:00");
  const dayEnd = toDateTime(dateISO, "23:59:59");

  const [{ data: blocked }, { data: appts }] = await Promise.all([
    supabase
      .from("blocked_slots")
      .select("start_datetime, end_datetime")
      .lt("start_datetime", dayEnd.toISOString())
      .gt("end_datetime", dayStart.toISOString()),
    supabase
      .from("appointments")
      .select("start_at, end_at, service:services(buffer_minutes)")
      .in("status", ["confirmed", "pending"])
      .lt("start_at", dayEnd.toISOString())
      .gt("end_at", dayStart.toISOString()),
  ]);

  const busy: Interval[] = (blocked ?? []).map((b) => ({
    start: new Date(b.start_datetime),
    end: new Date(b.end_datetime),
  }));

  for (const a of appts ?? []) {
    const bufferMin = (a as any).service?.buffer_minutes ?? 0;
    const end = new Date(a.end_at);
    end.setMinutes(end.getMinutes() + bufferMin);
    busy.push({ start: new Date(a.start_at), end });
  }

  return busy;
}

/**
 * Retourne la liste des heures de début possibles (Date) pour une
 * prestation donnée, à une date donnée.
 */
export async function getAvailableSlots(
  dateISO: string,
  service: { duration_minutes: number; buffer_minutes: number }
): Promise<Date[]> {
  const [windows, busy] = await Promise.all([
    getWorkingWindows(dateISO),
    getBusyIntervals(dateISO),
  ]);

  const freeWindows = subtractIntervals(windows, busy);
  const totalMinutes = service.duration_minutes + service.buffer_minutes;
  const slots: Date[] = [];

  for (const w of freeWindows) {
    let cursor = new Date(w.start);
    while (true) {
      const slotEnd = new Date(cursor);
      slotEnd.setMinutes(slotEnd.getMinutes() + totalMinutes);
      if (slotEnd > w.end) break;
      // Ne propose pas de créneaux déjà passés (si on regarde "aujourd'hui")
      if (cursor.getTime() > Date.now()) {
        slots.push(new Date(cursor));
      }
      cursor.setMinutes(cursor.getMinutes() + SLOT_STEP_MINUTES);
    }
  }

  return slots;
}

/** Vérifie qu'un créneau précis est toujours libre juste avant de confirmer
 * la réservation (évite les doubles réservations en cas de clic simultané). */
export async function isSlotStillAvailable(
  dateISO: string,
  startAt: Date,
  service: { duration_minutes: number; buffer_minutes: number }
): Promise<boolean> {
  const slots = await getAvailableSlots(dateISO, service);
  return slots.some((s) => s.getTime() === startAt.getTime());
}
