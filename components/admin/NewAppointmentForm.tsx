"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchClients, getSlotsForDateAdmin, createManualAppointment } from "@/app/actions/admin-appointments";
import { formatParisTime } from "@/lib/timezone";

type Service = { id: string; name: string; price: number; duration_minutes: number };
type ClientResult = { id: string; first_name: string; last_name: string; phone: string | null; email: string | null };

export function NewAppointmentForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [clientMode, setClientMode] = useState<"search" | "new">("search");
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<ClientResult[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null);
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDateChange(value: string) {
    setDateISO(value);
    setSelectedSlot(null);
    if (!serviceId || !value) return;
    const result = await getSlotsForDateAdmin(serviceId, value);
    setSlots(result);
  }

  async function handleClientSearch(query: string) {
    setClientQuery(query);
    setSelectedClient(null);
    if (query.trim().length < 2) {
      setClientResults([]);
      return;
    }
    const results = await searchClients(query);
    setClientResults(results);
  }

  async function handleSubmit() {
    if (!serviceId || !selectedSlot) {
      setError("Choisis une prestation et un créneau.");
      return;
    }
    if (clientMode === "search" && !selectedClient) {
      setError("Choisis une cliente existante, ou passe en mode « Nouvelle cliente ».");
      return;
    }
    if (clientMode === "new" && (!newClient.firstName || !newClient.lastName)) {
      setError("Prénom et nom requis pour la nouvelle cliente.");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await createManualAppointment({
      serviceId,
      startAtISO: selectedSlot,
      clientId: clientMode === "search" ? selectedClient?.id : undefined,
      newClient: clientMode === "new" ? newClient : undefined,
    });
    setSaving(false);

    if (result.ok) {
      router.push("/admin/rendez-vous");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="mb-3 font-serif text-xl italic">Cliente</h2>
        <div className="mb-3 flex gap-2 text-sm">
          <button
            onClick={() => setClientMode("search")}
            className={`rounded-sm border px-4 py-2 ${clientMode === "search" ? "border-accent text-accent" : "border-line"}`}
          >
            Cliente existante
          </button>
          <button
            onClick={() => setClientMode("new")}
            className={`rounded-sm border px-4 py-2 ${clientMode === "new" ? "border-accent text-accent" : "border-line"}`}
          >
            Nouvelle cliente
          </button>
        </div>

        {clientMode === "search" ? (
          <div>
            <input
              value={clientQuery}
              onChange={(e) => handleClientSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone ou e-mail..."
              className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
            />
            {clientResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedClient(c); setClientResults([]); setClientQuery(`${c.first_name} ${c.last_name}`); }}
                    className="rounded-sm border border-line px-4 py-2 text-left text-sm hover:border-ink-soft"
                  >
                    {c.first_name} {c.last_name} — {c.phone || c.email}
                  </button>
                ))}
              </div>
            )}
            {selectedClient && (
              <p className="mt-2 text-sm text-accent">
                Sélectionnée : {selectedClient.first_name} {selectedClient.last_name}
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Prénom" value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
            <input placeholder="Nom" value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
            <input placeholder="E-mail" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
            <input placeholder="Téléphone" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="rounded-sm border border-line bg-surface px-4 py-2.5" />
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 font-serif text-xl italic">Prestation</h2>
        <select
          value={serviceId}
          onChange={(e) => { setServiceId(e.target.value); setDateISO(""); setSlots([]); setSelectedSlot(null); }}
          className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
        >
          <option value="">Choisir une prestation</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.duration_minutes} min — {s.price} €
            </option>
          ))}
        </select>
      </div>

      {serviceId && (
        <div className="mb-8">
          <h2 className="mb-3 font-serif text-xl italic">Date et heure</h2>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mb-4 w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
          {slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-sm border px-3 py-2 text-sm ${selectedSlot === slot ? "border-accent bg-accent text-white" : "border-line"}`}
                >
                  {formatParisTime(new Date(slot))}
                </button>
              ))}
            </div>
          )}
          {dateISO && slots.length === 0 && <p className="text-sm text-ink-soft">Aucun créneau libre ce jour-là.</p>}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-sm bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {saving ? "Création…" : "Créer le rendez-vous"}
      </button>
    </div>
  );
}
