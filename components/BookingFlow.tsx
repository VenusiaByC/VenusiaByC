"use client";

import { useState, useTransition } from "react";
import { getSlotsForDate, createAppointment } from "@/app/actions/booking";
import { formatDuration } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
};

export function BookingFlow({ services }: { services: Service[] }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dateISO, setDateISO] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  function pickService(service: Service) {
    setSelectedService(service);
    setStep(2);
    setDateISO("");
    setSlots([]);
    setSelectedSlot(null);
    setError(null);
  }

  function pickDate(value: string) {
    setDateISO(value);
    setSelectedSlot(null);
    setError(null);
    if (!value || !selectedService) return;
    startTransition(async () => {
      const result = await getSlotsForDate(selectedService.id, value);
      setSlots(result);
    });
  }

  function pickSlot(slot: string) {
    setSelectedSlot(slot);
    setStep(3);
  }

  function submit() {
    if (!selectedService || !selectedSlot || !dateISO) return;
    setError(null);
    startTransition(async () => {
      const result = await createAppointment({
        serviceId: selectedService.id,
        dateISO,
        startAtISO: selectedSlot,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      });
      if (result.ok) {
        setConfirmedId(result.appointmentId);
        setStep(4);
      } else {
        setError(result.error);
      }
    });
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  if (step === 4 && confirmedId) {
    return (
      <div className="mx-auto max-w-lg rounded-sm border border-line bg-surface p-10 text-center">
        <h2 className="font-serif text-3xl italic text-accent">C'est confirmé !</h2>
        <p className="mt-4 text-ink-soft">
          Ton rendez-vous pour <strong className="text-ink">{selectedService?.name}</strong> le{" "}
          {new Date(selectedSlot!).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" })} à{" "}
          {new Date(selectedSlot!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })} est enregistré.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Un e-mail de confirmation t'arrivera sous peu. À bientôt chez Venusia !
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Étape 1 : choix de la prestation */}
      <div className="mb-10">
        <h2 className="mb-4 font-serif text-2xl italic">1. Choisis ta prestation</h2>
        <div className="grid gap-3">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => pickService(s)}
              className={`flex items-center justify-between rounded-sm border p-5 text-left transition ${
                selectedService?.id === s.id ? "border-accent bg-blush" : "border-line hover:border-ink-soft"
              }`}
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-ink-soft">{formatDuration(s.duration_minutes)}</div>
              </div>
              <div className="font-serif italic text-accent">{s.price} €</div>
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2 : date et heure */}
      {selectedService && (
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-2xl italic">2. Choisis une date et une heure</h2>
          <input
            type="date"
            min={todayISO}
            value={dateISO}
            onChange={(e) => pickDate(e.target.value)}
            className="mb-4 w-full rounded-sm border border-line bg-surface px-4 py-3"
          />
          {isPending && dateISO && <p className="text-sm text-ink-soft">Recherche des créneaux…</p>}
          {!isPending && dateISO && slots.length === 0 && (
            <p className="text-sm text-ink-soft">Aucun créneau disponible ce jour-là, essaie une autre date.</p>
          )}
          {slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => pickSlot(slot)}
                  className={`rounded-sm border px-3 py-2.5 text-sm transition ${
                    selectedSlot === slot ? "border-accent bg-accent text-white" : "border-line hover:border-ink-soft"
                  }`}
                >
                  {new Date(slot).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Étape 3 : informations + confirmation */}
      {step >= 3 && selectedSlot && (
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-2xl italic">3. Tes coordonnées</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="rounded-sm border border-line bg-surface px-4 py-3"
            />
            <input
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="rounded-sm border border-line bg-surface px-4 py-3"
            />
            <input
              placeholder="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-sm border border-line bg-surface px-4 py-3"
            />
            <input
              placeholder="Téléphone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-sm border border-line bg-surface px-4 py-3"
            />
          </div>
          {error && <p className="mt-3 text-sm text-accent">{error}</p>}
          <button
            onClick={submit}
            disabled={isPending || !form.firstName || !form.lastName || (!form.email && !form.phone)}
            className="mt-5 rounded-sm bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
          >
            {isPending ? "Confirmation en cours…" : "Confirmer le rendez-vous"}
          </button>
        </div>
      )}
    </div>
  );
}
