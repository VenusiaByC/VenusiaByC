import { notFound } from "next/navigation";
import { getAppointmentDetail } from "@/app/actions/admin-appointments";
import { AppointmentDetail } from "@/components/admin/AppointmentDetail";

export default async function RendezVousDetailPage({ params }: { params: { id: string } }) {
  const appointment = await getAppointmentDetail(params.id);
  if (!appointment) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">Détail du rendez-vous</h1>
      <AppointmentDetail appointment={appointment as any} />
    </div>
  );
}
