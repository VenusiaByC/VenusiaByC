/** Échappe le texte selon les règles du format iCalendar (RFC 5545). */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Formate une Date en "YYYYMMDDTHHMMSSZ" (heure UTC), le format attendu
 * par iCalendar — Apple Calendar la reconvertit ensuite dans le fuseau
 * horaire de l'appareil automatiquement. */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

type AppointmentForIcs = {
  id: string;
  start_at: string;
  end_at: string;
  notes: string;
  client: { first_name: string; last_name: string; phone: string | null; email: string | null } | null;
  service: { name: string; price: number } | null;
};

export function buildIcsCalendar(appointments: AppointmentForIcs[], brandName: string, address: string): string {
  const now = formatIcsDate(new Date());

  const events = appointments
    .map((a) => {
      const clientName = a.client ? `${a.client.first_name} ${a.client.last_name}` : "Cliente";
      const summary = `${clientName} — ${a.service?.name ?? "Rendez-vous"}`;
      const descriptionParts = [
        a.service ? `Prestation : ${a.service.name} (${a.service.price} €)` : "",
        a.client?.phone ? `Téléphone : ${a.client.phone}` : "",
        a.client?.email ? `E-mail : ${a.client.email}` : "",
        a.notes ? `Notes : ${a.notes}` : "",
      ].filter(Boolean);

      return [
        "BEGIN:VEVENT",
        `UID:venusia-${a.id}@venusia`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatIcsDate(new Date(a.start_at))}`,
        `DTEND:${formatIcsDate(new Date(a.end_at))}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        descriptionParts.length ? `DESCRIPTION:${escapeIcsText(descriptionParts.join("\\n"))}` : "",
        address ? `LOCATION:${escapeIcsText(address)}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//" + brandName + "//Rendez-vous//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(brandName + " — Rendez-vous")}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
