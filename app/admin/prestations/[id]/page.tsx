import { notFound } from "next/navigation";
import { getServiceAdmin } from "@/app/actions/admin-services";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditPrestationPage({ params }: { params: { id: string } }) {
  const service = await getServiceAdmin(params.id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl italic">Modifier la prestation</h1>
      <ServiceForm initial={service} />
    </div>
  );
}
