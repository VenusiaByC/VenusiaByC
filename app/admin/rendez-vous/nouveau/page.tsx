import { listActiveServices } from "@/app/actions/booking";
import { NewAppointmentForm } from "@/components/admin/NewAppointmentForm";

export default async function NouveauRendezVousPage() {
  const services = await listActiveServices();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">Nouveau rendez-vous</h1>
      {services.length === 0 ? (
        <p className="text-ink-soft">Ajoute au moins une prestation active avant de créer un rendez-vous.</p>
      ) : (
        <NewAppointmentForm services={services} />
      )}
    </div>
  );
}
