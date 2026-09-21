"use client";

import { useState } from "react";
import { saveWeeklyHours, type DayHours, DAY_LABELS } from "@/app/actions/admin-hours";

export function HoursEditor({ initial }: { initial: DayHours[] }) {
  const [week, setWeek] = useState<DayHours[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleClosed(dayIndex: number) {
    setWeek((w) =>
      w.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              is_closed: !d.is_closed,
              ranges: !d.is_closed ? [] : [{ start_time: "09:00", end_time: "18:00" }],
            }
          : d
      )
    );
    setSaved(false);
  }

  function addRange(dayIndex: number) {
    setWeek((w) =>
      w.map((d, i) =>
        i === dayIndex ? { ...d, ranges: [...d.ranges, { start_time: "14:00", end_time: "18:00" }] } : d
      )
    );
    setSaved(false);
  }

  function removeRange(dayIndex: number, rangeIndex: number) {
    setWeek((w) =>
      w.map((d, i) =>
        i === dayIndex ? { ...d, ranges: d.ranges.filter((_, ri) => ri !== rangeIndex) } : d
      )
    );
    setSaved(false);
  }

  function updateRange(dayIndex: number, rangeIndex: number, field: "start_time" | "end_time", value: string) {
    setWeek((w) =>
      w.map((d, i) =>
        i === dayIndex
          ? { ...d, ranges: d.ranges.map((r, ri) => (ri === rangeIndex ? { ...r, [field]: value } : r)) }
          : d
      )
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await saveWeeklyHours(week);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {week.map((day, dayIndex) => (
          <div key={day.day_of_week} className="rounded-sm border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">{DAY_LABELS[day.day_of_week]}</span>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={day.is_closed} onChange={() => toggleClosed(dayIndex)} />
                Fermé
              </label>
            </div>

            {!day.is_closed && (
              <div className="flex flex-col gap-2">
                {day.ranges.map((range, rangeIndex) => (
                  <div key={rangeIndex} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={range.start_time}
                      onChange={(e) => updateRange(dayIndex, rangeIndex, "start_time", e.target.value)}
                      className="rounded-sm border border-line px-3 py-1.5 text-sm"
                    />
                    <span className="text-ink-soft">—</span>
                    <input
                      type="time"
                      value={range.end_time}
                      onChange={(e) => updateRange(dayIndex, rangeIndex, "end_time", e.target.value)}
                      className="rounded-sm border border-line px-3 py-1.5 text-sm"
                    />
                    {day.ranges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRange(dayIndex, rangeIndex)}
                        className="text-sm text-accent"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addRange(dayIndex)}
                  className="self-start text-sm text-ink-soft underline"
                >
                  + Ajouter une plage (ex : coupure déjeuner)
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-sm bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer les horaires"}
        </button>
        {saved && <span className="text-sm text-ink-soft">Enregistré ✓</span>}
      </div>
    </div>
  );
}
