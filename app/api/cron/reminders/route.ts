import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAppointmentSms } from "@/lib/sms/notifications";

/**
 * Appelé automatiquement toutes les heures par Vercel Cron (voir
 * vercel.json). Cherche les rendez-vous qui ont lieu dans 47 à 49 heures
 * (fenêtre de 2h pour ne rien manquer entre deux exécutions) et n'ont pas
 * encore reçu leur SMS de rappel, puis l'envoie.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = Date.now();
  const windowStart = new Date(now + 47 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + 49 * 60 * 60 * 1000).toISOString();

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("start_at", windowStart)
    .lte("start_at", windowEnd);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const appt of appointments ?? []) {
    try {
      await sendAppointmentSms(appt.id, "reminder");
      await supabase
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appt.id);
      sent++;
    } catch {
      // On continue avec les suivants même si un envoi échoue ; l'échec
      // est déjà tracé dans notification_log par sendAppointmentSms.
    }
  }

  return NextResponse.json({ checked: appointments?.length ?? 0, sent });
}
