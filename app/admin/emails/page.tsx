import { getEmailTemplateAdmin } from "@/app/actions/admin-emails";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

export default async function EmailsPage() {
  const confirmation = await getEmailTemplateAdmin("confirmation");

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl italic">E-mails</h1>
      <p className="mb-8 text-ink-soft">
        E-mail envoyé automatiquement à la cliente dès qu'elle confirme un rendez-vous.
      </p>
      <EmailTemplateEditor name="confirmation" initial={confirmation} />
    </div>
  );
}
