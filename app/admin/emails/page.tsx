import { getEmailTemplateAdmin } from "@/app/actions/admin-emails";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

const TEMPLATES = [
  { name: "confirmation", label: "Confirmation de réservation", desc: "Envoyé dès qu'une cliente réserve (ou que tu crées un rendez-vous manuellement)." },
  { name: "cancellation", label: "Annulation", desc: "Envoyé quand un rendez-vous est annulé." },
  { name: "reschedule", label: "Déplacement", desc: "Envoyé quand un rendez-vous est déplacé vers un autre créneau." },
  { name: "admin_notification", label: "Notification pour toi", desc: "Envoyé à TOI (voir Paramètres pour l'adresse) dès qu'une cliente réserve en ligne." },
];

export default async function EmailsPage() {
  const templates = await Promise.all(
    TEMPLATES.map(async (t) => ({ ...t, content: await getEmailTemplateAdmin(t.name) }))
  );

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">E-mails</h1>

      <div className="flex flex-col gap-14">
        {templates.map((t) => (
          <section key={t.name}>
            <h2 className="mb-1 text-lg font-medium">{t.label}</h2>
            <p className="mb-4 text-sm text-ink-soft">{t.desc}</p>
            <EmailTemplateEditor name={t.name} initial={t.content} />
          </section>
        ))}
      </div>
    </div>
  );
}
