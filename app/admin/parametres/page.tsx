import { getSettingsAdmin } from "@/app/actions/admin-settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function ParametresPage() {
  const settings = await getSettingsAdmin();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">Paramètres</h1>
      <p className="mb-8 text-ink-soft">
        Tout ce qui est ici se répercute immédiatement sur le site, sans jamais toucher au code.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
