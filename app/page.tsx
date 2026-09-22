import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { formatDuration } from "@/lib/format";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

async function getFeaturedServices() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("services")
      .select("id, name, description, price, duration_minutes")
      .eq("active", true)
      .order("display_order")
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getPublishedReviews() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, rating, comment")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getGalleryPreview() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("gallery_photos").select("id, image_url, caption").order("display_order").limit(4);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getOpenHoursSummary() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("business_hours")
      .select("day_of_week, start_time, end_time, is_closed")
      .eq("is_closed", false)
      .order("day_of_week")
      .order("start_time");
    if (!data || data.length === 0) return [];

    const byDay = new Map<number, string[]>();
    for (const row of data) {
      const list = byDay.get(row.day_of_week) ?? [];
      list.push(`${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)}`);
      byDay.set(row.day_of_week, list);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([day, ranges]) => ({ label: DAY_LABELS[day], hours: ranges.join(", ") }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [settings, services, hours, galleryPreview, reviews] = await Promise.all([
    getSiteSettings(),
    getFeaturedServices(),
    getOpenHoursSummary(),
    getGalleryPreview(),
    getPublishedReviews(),
  ]);

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-line/60 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-7 py-4">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" />
          <nav className="hidden gap-9 text-sm text-ink-soft md:flex">
            <a href="#prestations" className="hover:text-ink">Prestations</a>
            <a href="/galerie" className="hover:text-ink">Galerie</a>
            <a href="#contact" className="hover:text-ink">Contact</a>
          </nav>
          <a
            href="/reserver"
            className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            Réserver
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-7 py-16 md:grid-cols-2 md:py-24">
        <div>
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="lg" className="mb-8" />
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {settings.hero_subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/reserver"
              className="rounded-sm bg-accent px-7 py-3.5 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              Réserver un rendez-vous
            </a>
            <a
              href="#prestations"
              className="rounded-sm border border-line px-7 py-3.5 text-sm font-medium transition hover:border-ink-soft"
            >
              Voir les prestations
            </a>
          </div>
        </div>

        <div className="relative hidden h-[420px] md:block">
          <svg viewBox="0 0 420 480" className="h-full w-full">
            <defs>
              <linearGradient id="heroBlob" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-gold)" />
              </linearGradient>
            </defs>
            <path d="M120 40 C220 10 360 60 380 170 C400 280 320 340 240 400 C160 460 60 440 30 350 C0 260 20 70 120 40Z" fill="var(--color-blush)" />
            <path d="M150 90 C230 70 320 120 330 200 C340 290 270 330 200 370 C130 410 70 380 60 310 C50 230 70 110 150 90Z" fill="url(#heroBlob)" opacity="0.92" />
            <circle cx="205" cy="230" r="58" fill="var(--color-bg)" opacity="0.9" />
            <circle cx="205" cy="230" r="30" fill="var(--color-gold)" />
          </svg>
        </div>
      </section>

      <section className="bg-blush px-7 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-2 font-serif text-lg italic text-accent">Créneaux à jour</div>
            <p className="text-sm text-ink-soft">Le calendrier n'affiche que ce qui est réellement disponible, en temps réel.</p>
          </div>
          <div>
            <div className="mb-2 font-serif text-lg italic text-accent">Confirmation immédiate</div>
            <p className="text-sm text-ink-soft">Un e-mail et un SMS dès que votre rendez-vous est validé.</p>
          </div>
          <div>
            <div className="mb-2 font-serif text-lg italic text-accent">Rappel avant votre venue</div>
            <p className="text-sm text-ink-soft">Un SMS de rappel avant le jour J, pour ne jamais l'oublier.</p>
          </div>
        </div>
      </section>

      <section id="prestations" className="px-7 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 font-serif text-3xl md:text-4xl">
            Les prestations les plus demandées
          </h2>
          {services.length === 0 ? (
            <p className="text-ink-soft">
              Les prestations apparaîtront ici dès qu'elles seront ajoutées
              depuis l'espace admin.
            </p>
          ) : (
            <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
              {services.map((s) => (
                <div key={s.id} className="flex flex-col gap-4 bg-surface p-8">
                  <h3 className="font-serif text-2xl italic">{s.name}</h3>
                  <p className="flex-grow text-sm text-ink-soft">{s.description}</p>
                  <div className="flex items-baseline justify-between border-t border-line pt-3 text-sm">
                    <span>{formatDuration(s.duration_minutes)}</span>
                    <span className="font-serif italic text-accent">{s.price} €</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {galleryPreview.length > 0 && (
        <section className="px-7 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl md:text-4xl">Nos réalisations</h2>
              <a href="/galerie" className="text-sm text-ink-soft underline">Voir toute la galerie →</a>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryPreview.map((p) => (
                <img key={p.id} src={p.image_url} alt={p.caption ?? ""} className="aspect-square w-full rounded-sm object-cover" />
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="bg-blush px-7 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 font-serif text-3xl md:text-4xl">Elles en parlent</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-sm bg-surface p-6">
                  <div className="mb-3 text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  {r.comment && <p className="mb-3 text-sm text-ink-soft">"{r.comment}"</p>}
                  <p className="text-sm font-medium">{r.author_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="px-7 pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-sm bg-ink px-10 py-14 text-bg sm:grid-cols-3 sm:px-14">
          <div>
            <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" className="mb-3 brightness-0 invert" />
            <p className="text-sm text-bg/70">
              Un rendez-vous rapide, un moment pour vous.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-base font-medium">Horaires</h3>
            {hours.length === 0 ? (
              <p className="text-sm text-bg/70">À venir</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm text-bg/80">
                {hours.map((h) => (
                  <li key={h.label} className="flex justify-between gap-4">
                    <span>{h.label}</span>
                    <span>{h.hours}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-base font-medium">Contact</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-bg/80">
              <li>{settings.contact_phone || "Téléphone à venir"}</li>
              <li>{settings.contact_email || "E-mail à venir"}</li>
              <li>{settings.contact_address || "Adresse à venir"}</li>
              {settings.instagram_handle && <li>{settings.instagram_handle}</li>}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
