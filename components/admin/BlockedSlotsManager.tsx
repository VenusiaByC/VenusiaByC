"use client";

import { useState } from "react";
import { addBlockedSlot, deleteBlockedSlot } from "@/app/actions/admin-blocked";
import { formatParisDate, formatParisTime } from "@/lib/timezone";

type BlockedSlot = { id: string; start_datetime: string; end_datetime: string; reason: string };

export function BlockedSlotsManager({ initial }: { initial: BlockedSlot[] }) {
  const [slots, setSlots] = useState<BlockedSlot[]>(initial);
  const [mode, setMode] = useState<"days" | "hours">("days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setSaving(true);
    setError(null);

    const input =
      mode === "days"
        ? { mode: "days" as const, startDate, endDate: endDate || startDate, reason }
        : { mode: "hours" as const, date, startTime, endTime, reason };

    const result = await addBlockedSlot(input);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Petite astuce : on recharge juste la liste locale avec une entrée
    // provisoire, l'ID réel sera correct après le prochain rechargement.
    setSlots((prev) =>
      [
        ...prev,
        {
          id: crypto.randomUUID(),
          start_datetime:
            mode === "days" ? `${startDate}T00:00:00` : `${date}T${startTime}:00`,
          end_datetime: mode === "days" ? `${endDate || startDate}T23:59:00` : `${date}T${endTime}:00`,
          reason,
        },
      ].sort((a, b) => a.start_datetime.localeCompare(b.start_datetime))
    );
    setStartDate("");
    setEndDate("");
    setDate("");
    setReason("");
  }

  async function handleDelete(id: string) {
    await deleteBlockedSlot(id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-8 rounded-sm border border-line bg-surface p-5">
        <div className="mb-4 flex gap-2 text-sm">
          <button
            onClick={() => setMode("days")}
            className={`rounded-sm border px-4 py-2 ${mode === "days" ? "border-accent text-accent" : "border-line"}`}
          >
            Jour(s) entier(s)
          </button>
          <button
            onClick={() => setMode("hours")}
            className={`rounded-sm border px-4 py-2 ${mode === "hours" ? "border-accent text-accent" : "border-line"}`}
          >
            Quelques heures
          </button>
        </div>

        {mode === "days" ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Du</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-sm border border-line px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Au (optionnel)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-sm border border-line px-3 py-2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-sm border border-line px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">De</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-sm border border-line px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">À</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-sm border border-line px-3 py-2" />
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="mb-1 block text-sm text-ink-soft">Motif (optionnel)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ex : congés"
            className="w-full max-w-sm rounded-sm border border-line px-3 py-2"
          />
        </div>

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        <button
          onClick={handleAdd}
          disabled={saving || (mode === "days" ? !startDate : !date)}
          className="mt-4 rounded-sm bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {saving ? "Ajout…" : "Bloquer cette période"}
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucune indisponibilité à venir.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {slots.map((s) => {
            const start = new Date(s.start_datetime);
            const end = new Date(s.end_datetime);
            const sameDay = start.toDateString() === end.toDateString();
            return (
              <div key={s.id} className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm">
                <span>
                  {sameDay ? (
                    <>
                      {formatParisDate(start, { weekday: "long", day: "numeric", month: "long" })}
                      {", "}
                      {formatParisTime(start)} – {formatParisTime(end)}
                    </>
                  ) : (
                    <>
                      Du {formatParisDate(start, { day: "numeric", month: "long" })} au{" "}
                      {formatParisDate(end, { day: "numeric", month: "long" })}
                    </>
                  )}
                  {s.reason && <span className="text-ink-soft"> ({s.reason})</span>}
                </span>
                <button onClick={() => handleDelete(s.id)} className="text-accent">
                  Supprimer
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
