import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";

async function getPhotos() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("gallery_photos").select("*").order("display_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function GaleriePublicPage() {
  const [settings, photos] = await Promise.all([getSiteSettings(), getPhotos()]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-7 py-5">
        <a href="/" className="inline-block">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" />
        </a>
      </header>

      <div className="px-7 py-14">
        <h1 className="mb-10 font-serif text-4xl italic">Galerie</h1>
        {photos.length === 0 ? (
          <p className="text-ink-soft">La galerie arrive bientôt.</p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 md:columns-4 [&>*]:mb-4">
            {photos.map((p) => (
              <a key={p.id} href={p.image_url} target="_blank" rel="noopener noreferrer" className="block break-inside-avoid">
                <img src={p.image_url} alt={p.caption} className="w-full rounded-sm object-cover" />
                {p.caption && <p className="mt-1 text-xs text-ink-soft">{p.caption}</p>}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
