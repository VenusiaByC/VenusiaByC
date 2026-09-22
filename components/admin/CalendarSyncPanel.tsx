"use client";

import { useState } from "react";
import { regenerateCalendarToken } from "@/app/actions/admin-settings";

export function CalendarSyncPanel({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // window.location n'existe que côté navigateur ; on protège pour le rendu serveur.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const httpsUrl = `${origin}/api/calendar/${token}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");

  function copy() {
    navigator.clipboard.writeText(httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    if (!confirm("Le lien actuel cessera de fonctionner et il faudra se réabonner sur chaque appareil. Continuer ?")) return;
    setRegenerating(true);
    const result = await regenerateCalendarToken();
    setRegenerating(false);
    if (result.ok) setToken(result.token);
  }

  return (
    <div className="rounded-sm border border-line bg-surface p-5">
      <p className="mb-3 text-sm text-ink-soft">
        Ce lien est privé et personnel — ne le partage avec personne d'autre que toi.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <code className="flex-1 break-all rounded-sm border border-line bg-bg px-3 py-2 text-xs">{httpsUrl}</code>
        <button onClick={copy} className="rounded-sm border border-line px-4 py-2 text-sm transition hover:border-ink-soft">
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>

      <a
        href={webcalUrl}
        className="mb-4 inline-block rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
      >
        Ouvrir directement sur cet appareil
      </a>

      <div className="mt-2 border-t border-line pt-4">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-sm text-accent underline disabled:opacity-50"
        >
          {regenerating ? "Régénération…" : "Régénérer le lien (si partagé par erreur)"}
        </button>
      </div>
    </div>
  );
}
