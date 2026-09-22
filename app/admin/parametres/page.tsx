import { getSettingsAdmin } from "@/app/actions/admin-settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { CalendarSyncPanel } from "@/components/admin/CalendarSyncPanel";
import { getOrCreateIcsToken } from "@/lib/ics-token";

export default async function ParametresPage() {
  const [settings, icsToken] = await Promise.all([getSettingsAdmin(), getOrCreateIcsToken()]);

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Paramètres</h1>
      <p className="mb-8 text-ink-soft">
        Tout ce qui est ici se répercute immédiatement sur le site, sans jamais toucher au code.
      </p>
      <SettingsForm initial={settings} />

      <section className="mt-14 max-w-3xl">
        <h2 className="mb-1 text-lg font-medium">Synchronisation Apple Calendar</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Abonne-toi une seule fois depuis l'app Calendrier (iPhone/Mac) : tous tes rendez-vous
          Venusia à venir apparaîtront automatiquement, mis à jour environ toutes les heures.
        </p>
        <CalendarSyncPanel initialToken={icsToken} />
      </section>
    </div>
  );
}
