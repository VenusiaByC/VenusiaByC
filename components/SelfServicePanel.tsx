"use client";

import { useState } from "react";
import {
  selfCancelAppointment,
  getSelfServiceSlots,
  selfRescheduleAppointment,
} from "@/app/actions/self-service";
import { formatParisDate, formatParisTime } from "@/lib/timezone";
import { formatDuration } from "@/lib/format";

type Appointment = {
  id: string;
  start_at: string;
  status: string;
  service: { name: string; price: number; duration_minutes: number } | null;
};

export function SelfServicePanel({
  token,
  appointment,
  canManage,
  minHours,
}: {
  token: string;
  appointment: Appointment;
  canManage: boolean;
  minHours: number;
}) {
  const [status, setStatus] = useState(appointment.status);
  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [dateISO, setDateISO] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    setSaving(true);
    setError(null);
    const result = await selfCancelAppointment(token);
    setSaving(false);
    if (result.ok) {
      setStatus("cancelled");
      setMessage("Ton rendez-vous a bien été annulé.");
    } else {
      setError(result.error);
    }
  }

  async function loadSlots(value: string) {
    setDateISO(value);
    const result = await getSelfServiceSlots(token, value);
    setSlots(result);
  }

  async function pickSlot(slot: string) {
    setSaving(true);
    setError(null);
    const result = await selfRescheduleAppointment(token, dateISO, slot);
    setSaving(false);
    if (result.ok) {
      setMessage("Ton rendez-vous a bien été déplacé. Un e-mail de confirmation t'arrive.");
      setMode("view");
    } else {
      setError(result.error);
    }
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-sm border border-line bg-surface p-8 text-center">
        <p className="text-ink-soft">Ce rendez-vous a été annulé.</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-line bg-surface p-8">
      <h2 className="mb-1 font-serif text-2xl italic">{appointment.service?.name}</h2>
      <p className="mb-6 text-ink-soft">
        {formatParisDate(new Date(appointment.start_at), { weekday: "long", day: "numeric", month: "long" })}
        {" à "}
        {formatParisTime(new Date(appointment.start_at))} · {formatDuration(appointment.service?.duration_minutes ?? 0)} ·{" "}
        {appointment.service?.price} €
      </p>

      {message && <p className="mb-4 text-sm text-accent">{message}</p>}
      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {!canManage ? (
        <p className="text-sm text-ink-soft">
          Ce rendez-vous ne peut plus être modifié en ligne (moins de {minHours}h avant). Contacte-nous directement pour tout changement.
        </p>
      ) : mode === "view" ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMode("reschedule")}
            className="rounded-sm border border-line px-6 py-3 text-sm transition hover:border-ink-soft"
          >
            Modifier la date
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="rounded-sm border border-line px-6 py-3 text-sm text-accent transition hover:border-accent disabled:opacity-50"
          >
            Annuler ce rendez-vous
          </button>
        </div>
      ) : (
        <div>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={dateISO}
            onChange={(e) => loadSlots(e.target.value)}
            className="mb-4 w-full rounded-sm border border-line px-4 py-2.5"
          />
          {slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => pickSlot(slot)}
                  disabled={saving}
                  className="rounded-sm border border-line px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
                >
                  {formatParisTime(new Date(slot))}
                </button>
              ))}
            </div>
          )}
          {dateISO && slots.length === 0 && <p className="text-sm text-ink-soft">Aucun créneau libre ce jour-là.</p>}
          <button onClick={() => setMode("view")} className="mt-4 text-sm text-ink-soft underline">
            Annuler la modification
          </button>
        </div>
      )}
    </div>
  );
}
