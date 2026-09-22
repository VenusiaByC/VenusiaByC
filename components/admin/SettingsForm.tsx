"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveSettings } from "@/app/actions/admin-settings";
import type { SiteSettings } from "@/lib/settings";

const FONT_PAIRS = [
  { serif: "Fraunces", sans: "Work Sans", label: "Fraunces + Work Sans (actuel)" },
  { serif: "Playfair Display", sans: "Inter", label: "Playfair Display + Inter" },
  { serif: "Cormorant Garamond", sans: "Karla", label: "Cormorant Garamond + Karla" },
  { serif: "Lora", sans: "Nunito Sans", label: "Lora + Nunito Sans" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-ink-soft">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded-sm border border-line" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-sm border border-line px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `logo-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      setError("Erreur lors de l'envoi du logo : " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    set("logo_url", data.publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await saveSettings(settings);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="max-w-3xl">
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Nom de la marque</label>
            <input value={settings.brand_name} onChange={(e) => set("brand_name", e.target.value)} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)} className="text-sm" />
            {uploading && <p className="mt-1 text-sm text-ink-soft">Envoi en cours…</p>}
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo actuel" className="mt-2 h-12 w-auto rounded-sm border border-line object-contain p-2" />
            )}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Couleurs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Fond" value={settings.color_bg} onChange={(v) => set("color_bg", v)} />
          <ColorField label="Surface (cartes)" value={settings.color_surface} onChange={(v) => set("color_surface", v)} />
          <ColorField label="Texte principal" value={settings.color_ink} onChange={(v) => set("color_ink", v)} />
          <ColorField label="Texte secondaire" value={settings.color_ink_soft} onChange={(v) => set("color_ink_soft", v)} />
          <ColorField label="Accent (boutons)" value={settings.color_accent} onChange={(v) => set("color_accent", v)} />
          <ColorField label="Accent foncé (survol)" value={settings.color_accent_dark} onChange={(v) => set("color_accent_dark", v)} />
          <ColorField label="Fond doux" value={settings.color_blush} onChange={(v) => set("color_blush", v)} />
          <ColorField label="Doré (détails)" value={settings.color_gold} onChange={(v) => set("color_gold", v)} />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Typographies</h2>
        <div className="flex flex-col gap-2">
          {FONT_PAIRS.map((pair) => (
            <label key={pair.label} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={settings.font_serif === pair.serif && settings.font_sans === pair.sans}
                onChange={() => { set("font_serif", pair.serif); set("font_sans", pair.sans); }}
              />
              {pair.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Page d'accueil</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Titre principal</label>
            <textarea value={settings.hero_title} onChange={(e) => set("hero_title", e.target.value)} rows={2} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Sous-titre</label>
            <textarea value={settings.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} rows={2} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Téléphone</label>
            <input value={settings.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">E-mail affiché</label>
            <input value={settings.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-soft">Adresse</label>
            <input value={settings.contact_address} onChange={(e) => set("contact_address", e.target.value)} className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">Instagram</label>
            <input value={settings.instagram_handle} onChange={(e) => set("instagram_handle", e.target.value)} placeholder="@venusia" className="w-full rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Politique d'annulation</h2>
        <textarea
          value={settings.cancellation_policy}
          onChange={(e) => set("cancellation_policy", e.target.value)}
          rows={3}
          className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
        />
        <p className="mt-1 text-xs text-ink-soft">Ce texte apparaît dans l'e-mail de confirmation.</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Notifications</h2>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">
            T'envoyer un e-mail à chaque nouvelle réservation, à cette adresse :
          </label>
          <input
            type="email"
            value={settings.owner_notification_email}
            onChange={(e) => set("owner_notification_email", e.target.value)}
            placeholder="Laisse vide pour utiliser ton adresse SMTP configurée"
            className="w-full max-w-sm rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium">Programme de fidélité</h2>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.loyalty_enabled === "true"}
            onChange={(e) => set("loyalty_enabled", e.target.checked ? "true" : "false")}
          />
          Activer le programme de fidélité
        </label>
        {settings.loyalty_enabled === "true" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Points gagnés par rendez-vous terminé</label>
              <input
                type="number"
                min="0"
                value={settings.loyalty_points_per_visit}
                onChange={(e) => set("loyalty_points_per_visit", e.target.value)}
                className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Seuil pour la récompense</label>
              <input
                type="number"
                min="1"
                value={settings.loyalty_reward_threshold}
                onChange={(e) => set("loyalty_reward_threshold", e.target.value)}
                className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-ink-soft">Récompense (texte libre)</label>
              <input
                value={settings.loyalty_reward_description}
                onChange={(e) => set("loyalty_reward_description", e.target.value)}
                className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
              />
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-soft">
          Les points sont attribués automatiquement quand tu marques un rendez-vous "Terminé". Visibles et
          ajustables sur la fiche de chaque cliente.
        </p>
      </section>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-3">
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
  );
}
