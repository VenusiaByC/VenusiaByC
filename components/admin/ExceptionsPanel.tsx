"use client";

import { useState } from "react";
import { addException, deleteException } from "@/app/actions/admin-hours";

type Exception = {
  id: string;
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
};

export function ExceptionsPanel({ initial }: { initial: Exception[] }) {
  const [exceptions, setExceptions] = useState<Exception[]>(initial);
  const [form, setForm] = useState({
    date: "",
    is_closed: false,
    start_time: "09:00",
    end_time: "18:00",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.date) return;
    setSaving(true);
    const result = await addException({
      date: form.date,
      is_closed: form.is_closed,
      start_time: form.start_time,
      end_time: form.end_time,
      reason: form.reason,
    });
    setSaving(false);
    if (result.ok) {
      setExceptions((prev) => {
        const withoutDup = prev.filter((e) => e.date !== form.date);
        return [...withoutDup, { id: crypto.randomUUID(), ...form }].sort((a, b) => a.date.localeCompare(b.date));
      });
      setForm({ date: "", is_closed: false, start_time: "09:00", end_time: "18:00", reason: "" });
    }
  }

  async function handleDelete(id: string) {
    await deleteException(id);
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-sm border border-line bg-surface p-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div>
          <label className="mb-1 block text-sm text-ink-soft">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-sm border border-line px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_closed}
            onChange={(e) => setForm({ ...form, is_closed: e.target.checked })}
          />
          Fermé ce jour-là
        </label>
        {!form.is_closed && (
          <>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">De</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="rounded-sm border border-line px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">À</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="rounded-sm border border-line px-3 py-2"
              />
            </div>
          </>
        )}
        <div className="flex-1">
          <label className="mb-1 block text-sm text-ink-soft">Motif (optionnel)</label>
          <input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="ex : formation"
            className="w-full rounded-sm border border-line px-3 py-2"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !form.date}
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>

      {exceptions.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun horaire exceptionnel à venir.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {exceptions.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm">
              <span>
                {new Date(e.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                {" — "}
                {e.is_closed ? "Fermé" : `${e.start_time} – ${e.end_time}`}
                {e.reason && <span className="text-ink-soft"> ({e.reason})</span>}
              </span>
              <button onClick={() => handleDelete(e.id)} className="text-accent">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
