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
