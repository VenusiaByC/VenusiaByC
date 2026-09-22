import { listGalleryPhotosAdmin } from "@/app/actions/admin-gallery";
import { GalleryManager } from "@/components/admin/GalleryManager";

export default async function GaleriePage() {
  const photos = await listGalleryPhotosAdmin();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Galerie</h1>
      <p className="mb-8 text-ink-soft">
        Tes plus belles réalisations, affichées sur la page d'accueil et une page dédiée du site.
      </p>
      <GalleryManager initial={photos} />
    </div>
  );
}
