import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";

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

export default async function HomePage() {
  const settings = await getSiteSettings();
  const services = await getFeaturedServices();

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-line/60 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-7 py-5">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} />
          <nav className="hidden gap-9 text-sm text-ink-soft md:flex">
            <a href="#prestations" className="hover:text-ink">Prestations</a>
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

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-7 py-16 md:grid-cols-2">
        <div>
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
      </section>

      <section id="prestations" className="bg-blush px-7 py-20">
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
                    <span>{s.duration_minutes} min</span>
                    <span className="font-serif italic text-accent">{s.price} €</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer id="contact" className="px-7 py-12 text-sm text-ink-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} className="text-lg" />
          <span>{settings.contact_phone || "Téléphone à venir"}</span>
          <span>{settings.contact_email || "E-mail à venir"}</span>
        </div>
      </footer>
    </main>
  );
}
