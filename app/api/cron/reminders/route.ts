import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAppointmentSms } from "@/lib/sms/notifications";
import { todayISOInBusinessTZ, addDaysToISO, parisWallTimeToUtc } from "@/lib/timezone";

/**
 * Appelé automatiquement une fois par jour par Vercel Cron (voir
 * vercel.json — le plan gratuit de Vercel limite les tâches planifiées à
 * une exécution par jour). Envoie le SMS de rappel à toutes les clientes
 * dont le rendez-vous a lieu "après-demain" (soit environ 48h avant,
 * à la journée près puisqu'on ne peut vérifier qu'une fois par jour).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const targetDateISO = addDaysToISO(todayISOInBusinessTZ(), 2);
  const windowStart = parisWallTimeToUtc(targetDateISO, "00:00").toISOString();
  const windowEnd = parisWallTimeToUtc(targetDateISO, "23:59").toISOString();

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

  return NextResponse.json({ targetDate: targetDateISO, checked: appointments?.length ?? 0, sent });
}
