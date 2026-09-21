"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setAppointmentStatus,
  rescheduleAppointment,
  getSlotsForDateAdmin,
  type AppointmentStatus,
} from "@/app/actions/admin-appointments";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmé" },
  { value: "pending", label: "En attente" },
  { value: "completed", label: "Terminé" },
  { value: "no_show", label: "Absence" },
  { value: "cancelled", label: "Annulé" },
];

type Appointment = {
  id: string;
  start_at: string;
  status: AppointmentStatus;
  notes: string;
  client: { id: string; first_name: string; last_name: string; phone: string | null; email: string | null; internal_notes: string } | null;
  service: { id: string; name: string; price: number; duration_minutes: number } | null;
};

export function AppointmentDetail({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  function handleStatusChange(next: AppointmentStatus) {
    setStatus(next);
    startTransition(async () => {
      await setAppointmentStatus(appointment.id, next);
      setMessage("Statut mis à jour ✓");
    });
  }

  function loadSlots(dateISO: string) {
    setNewDate(dateISO);
    if (!appointment.service) return;
    startTransition(async () => {
      const result = await getSlotsForDateAdmin(appointment.service!.id, dateISO);
      setSlots(result);
    });
  }

  function pickNewSlot(slot: string) {
    startTransition(async () => {
      const result = await rescheduleAppointment(appointment.id, slot);
      if (result.ok) {
        router.refresh();
        setShowReschedule(false);
        setMessage("Rendez-vous déplacé ✓");
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 rounded-sm border border-line bg-surface p-6">
        <h2 className="mb-1 font-serif text-2xl italic">
          {appointment.client?.first_name} {appointment.client?.last_name}
        </h2>
        <div className="mb-4 text-sm text-ink-soft">
          {appointment.client?.phone && <div>📞 {appointment.client.phone}</div>}
          {appointment.client?.email && <div>✉️ {appointment.client.email}</div>}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div>
            <div className="text-ink-soft">Prestation</div>
            <div className="font-medium">{appointment.service?.name}</div>
          </div>
          <div>
            <div className="text-ink-soft">Prix</div>
            <div className="font-medium">{appointment.service?.price} €</div>
          </div>
          <div>
            <div className="text-ink-soft">Date</div>
            <div className="font-medium">{formatParisDate(new Date(appointment.start_at), { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
          <div>
            <div className="text-ink-soft">Heure</div>
            <div className="font-medium">{formatParisTime(new Date(appointment.start_at))}</div>
          </div>
        </div>

        {appointment.client?.internal_notes && (
          <div className="border-t border-line pt-4 text-sm">
            <div className="mb-1 text-ink-soft">Notes internes (jamais visibles par la cliente)</div>
            <div>{appointment.client.internal_notes}</div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Statut</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={isPending}
              className={`rounded-sm border px-4 py-2 text-sm transition ${
                status === opt.value ? "border-accent bg-accent text-white" : "border-line hover:border-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {!showReschedule ? (
          <button
            onClick={() => setShowReschedule(true)}
            className="rounded-sm border border-line px-5 py-2.5 text-sm transition hover:border-ink-soft"
          >
            Déplacer ce rendez-vous
          </button>
        ) : (
          <div className="rounded-sm border border-line bg-surface p-5">
            <label className="mb-2 block text-sm font-medium">Nouvelle date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => loadSlots(e.target.value)}
              className="mb-4 rounded-sm border border-line px-3 py-2"
            />
            {slots.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => pickNewSlot(slot)}
                    className="rounded-sm border border-line px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
                  >
                    {formatParisTime(new Date(slot))}
                  </button>
                ))}
              </div>
            )}
            {newDate && slots.length === 0 && !isPending && (
              <p className="text-sm text-ink-soft">Aucun créneau libre ce jour-là.</p>
            )}
          </div>
        )}
      </div>

      {message && <p className="mt-4 text-sm text-ink-soft">{message}</p>}
    </div>
  );
}
