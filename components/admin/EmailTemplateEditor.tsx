"use client";

import { useState } from "react";
import { saveEmailTemplate } from "@/app/actions/admin-emails";

const VARIABLES = [
  { key: "prenom", desc: "Prénom de la cliente" },
  { key: "prestation", desc: "Nom de la prestation" },
  { key: "date", desc: "Date du rendez-vous" },
  { key: "heure", desc: "Heure du rendez-vous" },
  { key: "prix", desc: "Prix en euros" },
  { key: "adresse", desc: "Adresse configurée dans Paramètres" },
  { key: "marque", desc: "Nom de ta marque (Venusia)" },
  { key: "politique_annulation", desc: "Ta politique d'annulation" },
  { key: "lien_gestion", desc: "Lien pour annuler/modifier (utile dans la confirmation)" },
];

export function EmailTemplateEditor({
  name,
  initial,
}: {
  name: string;
  initial: { subject: string; body: string };
}) {
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await saveEmailTemplate(name, subject, body);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm text-ink-soft">Objet du mail</label>
        <input
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setSaved(false); }}
          className="mb-4 w-full rounded-sm border border-line bg-surface px-4 py-2.5"
        />
        <label className="mb-1 block text-sm text-ink-soft">Contenu</label>
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setSaved(false); }}
          rows={14}
          className="w-full rounded-sm border border-line bg-surface px-4 py-3 font-mono text-sm"
        />
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
