"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveService, deleteService, type ServiceInput } from "@/app/actions/admin-services";

type ServiceRecord = ServiceInput & { id?: string };

export function ServiceForm({ initial }: { initial?: ServiceRecord }) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceRecord>(
    initial ?? {
      name: "",
      description: "",
      category: "",
      price: 0,
      duration_minutes: 60,
      buffer_minutes: 0,
      display_order: 0,
      active: true,
      photos: [],
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("service-photos")
        .upload(path, file);

      if (uploadError) {
        setError("Erreur lors de l'envoi d'une photo : " + uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from("service-photos").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    setForm((f) => ({ ...f, photos: [...f.photos, ...uploadedUrls] }));
    setUploading(false);
  }

  function removePhoto(url: string) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveService(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/prestations");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    if (!confirm(`Supprimer définitivement "${form.name}" ?`)) return;
    const result = await deleteService(form.id);
    if (result.ok) {
      router.push("/admin/prestations");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-soft">Nom de la prestation</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-soft">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-soft">Catégorie</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="ex : Pose, Manucure, Nail art"
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-soft">Prix (€)</label>
          <input
            required
            type="number"
            step="0.5"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-soft">Durée (minutes)</label>
          <input
            required
            type="number"
            min="5"
            step="5"
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-soft">
            Battement après (minutes)
          </label>
          <input
            type="number"
            min="0"
            step="5"
            value={form.buffer_minutes}
            onChange={(e) => setForm({ ...form, buffer_minutes: parseInt(e.target.value) || 0 })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-soft">Ordre d'affichage</label>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <label htmlFor="active" className="text-sm">
            Prestation active (visible sur le site)
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-soft">Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="mb-3 text-sm"
          />
          {uploading && <p className="text-sm text-ink-soft">Envoi en cours…</p>}
          {form.photos.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.photos.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-24 w-24 rounded-sm border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-sm border border-line px-7 py-3 text-sm text-ink-soft transition hover:border-accent hover:text-accent"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
