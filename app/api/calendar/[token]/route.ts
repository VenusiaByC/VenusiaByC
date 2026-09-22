import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateIcsToken } from "@/lib/ics-token";
import { getSiteSettings } from "@/lib/settings";
import { buildIcsCalendar } from "@/lib/ics";

/**
 * Flux calendrier privé, à ajouter comme "calendrier abonné" dans
 * l'app Calendrier d'iPhone/Mac. Protégé par un jeton secret dans l'URL
 * plutôt qu'un mot de passe Apple/iCloud — voir Admin → Paramètres pour
 * le lien exact.
 */
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const validToken = await getOrCreateIcsToken();
  if (params.token !== validToken) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createAdminClient();
  const settings = await getSiteSettings();

  const now = Date.now();
  const windowStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + 180 * 24 * 60 * 60 * 1000).toISOString();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, start_at, end_at, notes, client:clients(first_name, last_name, phone, email), service:services(name, price)"
    )
    .in("status", ["confirmed", "pending"])
    .gte("start_at", windowStart)
    .lte("start_at", windowEnd)
    .order("start_at");

  const ics = buildIcsCalendar((appointments as any) ?? [], settings.brand_name, settings.contact_address);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="venusia-rendez-vous.ics"',
      "Cache-Control": "no-store",
    },
  });
}
