export const BUSINESS_TIMEZONE = "Europe/Paris";

/** "Aujourd'hui" au sens du fuseau horaire du salon, pas celui du serveur. */
export function todayISOInBusinessTZ(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatParisDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleDateString("fr-FR", { ...options, timeZone: BUSINESS_TIMEZONE });
}

export function formatParisTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", ...options, timeZone: BUSINESS_TIMEZONE });
}

/**
 * Convertit une heure "murale" à Paris (ex: 15 octobre 2026, 09:00) en
 * l'instant UTC exact correspondant — quel que soit le fuseau horaire par
 * défaut du serveur qui exécute ce code (Vercel ne permet pas de le
 * configurer, donc on ne peut pas s'y fier).
 *
 * Fonctionne aussi correctement autour des changements d'heure d'été/hiver.
 */
export function parisWallTimeToUtc(dateISO: string, time: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // 1) Hypothèse de départ : on traite l'heure murale comme si c'était déjà
  //    de l'UTC (forcément un peu fausse, mais un bon point de départ).
  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // 2) On calcule le décalage réel de Paris à cet instant approximatif
  //    (2h en été, 1h en hiver).
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(naiveUTC).map((p) => [p.type, p.value]));
  const asIfUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? "0" : parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  const offsetMinutes = (asIfUTC - naiveUTC.getTime()) / 60000;

  // 3) On corrige : l'instant UTC réel = hypothèse - décalage.
  return new Date(naiveUTC.getTime() - offsetMinutes * 60000);
}

/** Jour de la semaine (0 = dimanche ... 6 = samedi) d'une date calendaire,
 * sans dépendre du fuseau horaire du serveur. */
export function getDayOfWeekForDate(dateISO: string): number {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Ajoute (ou retire) des jours à une date calendaire "YYYY-MM-DD". */
export function addDaysToISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Le lundi de la semaine contenant cette date (semaine française). */
export function getMondayOfWeek(dateISO: string): string {
  const dow = getDayOfWeekForDate(dateISO); // 0 = dimanche ... 6 = samedi
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDaysToISO(dateISO, offset);
}
