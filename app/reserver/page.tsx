import { listActiveServices } from "@/app/actions/booking";
import { BookingFlow } from "@/components/BookingFlow";
import { Logo } from "@/components/Logo";
import { getSiteSettings } from "@/lib/settings";

export default async function ReserverPage() {
  const [services, settings] = await Promise.all([listActiveServices(), getSiteSettings()]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-7 py-5">
        <a href="/" className="inline-block">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} />
        </a>
      </header>
      <div className="px-7 py-14">
        {services.length === 0 ? (
          <p className="mx-auto max-w-lg text-center text-ink-soft">
            Les réservations ouvriront dès que les prestations seront configurées.
          </p>
        ) : (
          <BookingFlow services={services} paymentsEnabled={settings.payments_enabled === "true"} />
        )}
      </div>
    </main>
  );
}
