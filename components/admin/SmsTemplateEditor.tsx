"use client";

import { useState } from "react";
import { saveSmsTemplate } from "@/app/actions/admin-sms";

const VARIABLES = [
  { key: "prenom", desc: "Prénom de la cliente" },
  { key: "prestation", desc: "Nom de la prestation" },
  { key: "date", desc: "Date du rendez-vous" },
  { key: "heure", desc: "Heure du rendez-vous" },
  { key: "prix", desc: "Prix en euros" },
  { key: "marque", desc: "Nom de ta marque (Venusia)" },
];

export function SmsTemplateEditor({ name, initial }: { name: string; initial: string }) {
  const [body, setBody] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await saveSmsTemplate(name, body);
    setSaving(false);
    setSaved(true);
  }

  const charCount = body.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setSaved(false); }}
          rows={4}
          className="w-full rounded-sm border border-line bg-surface px-4 py-3 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-ink-soft">
          {charCount} caractères — {smsCount} SMS facturé{smsCount > 1 ? "s" : ""} (un SMS = 160 caractères)
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-sm bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved && <span className="text-sm text-ink-soft">Enregistré ✓</span>}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Variables disponibles</h3>
        <div className="flex flex-col gap-2">
          {VARIABLES.map((v) => (
            <div key={v.key} className="rounded-sm border border-line bg-surface px-3 py-2 text-sm">
              <code className="text-accent">{"{{" + v.key + "}}"}</code>
              <div className="text-xs text-ink-soft">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
