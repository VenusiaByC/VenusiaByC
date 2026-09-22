import { notFound } from "next/navigation";
import { getSelfServiceAppointment } from "@/app/actions/self-service";
import { getSiteSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";
import { SelfServicePanel } from "@/components/SelfServicePanel";
import { ReviewForm } from "@/components/ReviewForm";

export default async function ManageAppointmentPage({ params }: { params: { token: string } }) {
  const [result, settings] = await Promise.all([
    getSelfServiceAppointment(params.token),
    getSiteSettings(),
  ]);

  if (!result) notFound();

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-7 py-5">
        <a href="/" className="inline-block">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" />
        </a>
      </header>
      <div className="mx-auto max-w-lg px-7 py-14">
        <h1 className="mb-8 font-serif text-3xl italic">Ton rendez-vous</h1>
        <SelfServicePanel
          token={params.token}
          appointment={result.appointment as any}
          canManage={result.canManage}
          minHours={result.minHours}
        />
        {result.appointment.status === "completed" && !result.hasReview && (
          <ReviewForm token={params.token} />
        )}
      </div>
    </main>
  );
}
