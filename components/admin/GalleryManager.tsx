"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from "@/app/actions/admin-gallery";

type Photo = { id: string; image_url: string; caption: string; display_order: number };

export function GalleryManager({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) {
        setError("Erreur lors de l'envoi d'une photo : " + uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("gallery").getPublicUrl(path);
      const result = await addGalleryPhoto(data.publicUrl);
      if (result.ok) {
        setPhotos((prev) => [...prev, { id: crypto.randomUUID(), image_url: data.publicUrl, caption: "", display_order: prev.length }]);
      }
    }
    setUploading(false);
  }

  async function handleCaptionChange(id: string, caption: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  async function handleCaptionSave(photo: Photo) {
    await updateGalleryPhoto(photo.id, photo.caption, photo.display_order);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette photo de la galerie ?")) return;
    await deleteGalleryPhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-8">
        <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="text-sm" />
        {uploading && <p className="mt-2 text-sm text-ink-soft">Envoi en cours…</p>}
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucune photo pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-sm border border-line bg-surface p-2">
              <img src={photo.image_url} alt={photo.caption} className="mb-2 aspect-square w-full rounded-sm object-cover" />
              <input
                value={photo.caption}
                onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                onBlur={() => handleCaptionSave(photo)}
                placeholder="Légende (optionnel)"
                className="mb-2 w-full rounded-sm border border-line px-2 py-1.5 text-xs"
              />
              <button onClick={() => handleDelete(photo.id)} className="text-xs text-accent">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
