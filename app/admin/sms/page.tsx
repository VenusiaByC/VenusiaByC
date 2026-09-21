import { getSmsTemplateAdmin } from "@/app/actions/admin-sms";
import { SmsTemplateEditor } from "@/components/admin/SmsTemplateEditor";

const TEMPLATES = [
  { name: "confirmation", label: "Confirmation", desc: "Envoyé juste après une réservation (en ligne ou créée par toi)." },
  { name: "reminder", label: "Rappel 48h", desc: "Envoyé automatiquement 48h avant le rendez-vous." },
];

export default async function SmsPage() {
  const templates = await Promise.all(
    TEMPLATES.map(async (t) => ({ ...t, content: await getSmsTemplateAdmin(t.name) }))
  );

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">SMS</h1>
      <div className="flex flex-col gap-14">
        {templates.map((t) => (
          <section key={t.name}>
            <h2 className="mb-1 text-lg font-medium">{t.label}</h2>
            <p className="mb-4 text-sm text-ink-soft">{t.desc}</p>
            <SmsTemplateEditor name={t.name} initial={t.content} />
          </section>
        ))}
      </div>
    </div>
  );
}
