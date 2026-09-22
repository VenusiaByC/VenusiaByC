"use client";

import { useState, useTransition } from "react";
import { getSlotsForDate, createAppointment } from "@/app/actions/booking";
import { createAppointmentCheckout } from "@/app/actions/payments";
import { validateGiftCardCode } from "@/app/actions/payments";
import { formatDuration } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
};

export function BookingFlow({ services, paymentsEnabled }: { services: Service[]; paymentsEnabled: boolean }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dateISO, setDateISO] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [fullyCoveredByGiftCard, setFullyCoveredByGiftCard] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardStatus, setGiftCardStatus] = useState<{ valid: boolean; message: string } | null>(null);

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

  async function checkGiftCard() {
    if (!giftCardCode.trim()) {
      setGiftCardStatus(null);
      return;
    }
    const result = await validateGiftCardCode(giftCardCode);
    setGiftCardStatus(
      result.valid
        ? { valid: true, message: `Carte valide — solde : ${result.remaining} €` }
        : { valid: false, message: result.error }
    );
  }

  function submit(payOnline: boolean) {
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
        notes:
          !payOnline && giftCardCode && giftCardStatus?.valid
            ? `Carte cadeau à honorer en personne : ${giftCardCode.trim().toUpperCase()}`
            : "",
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (!payOnline) {
        setConfirmedId(result.appointmentId);
        setStep(4);
        return;
      }

      const checkout = await createAppointmentCheckout(
        result.appointmentId,
        giftCardStatus?.valid ? giftCardCode : undefined
      );
      if (!checkout.ok) {
        setError(checkout.error);
        return;
      }
      if (checkout.fullyCovered) {
        setConfirmedId(result.appointmentId);
        setFullyCoveredByGiftCard(true);
        setStep(4);
        return;
      }
      window.location.href = checkout.url;
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
        {fullyCoveredByGiftCard && (
          <p className="mt-2 text-sm text-accent">Entièrement réglé par ta carte cadeau — rien à payer sur place.</p>
        )}
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

      {/* Étape 3 : informations + paiement */}
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

          <div className="mt-4">
            <div className="flex gap-2">
              <input
                placeholder="Code carte cadeau (optionnel)"
                value={giftCardCode}
                onChange={(e) => { setGiftCardCode(e.target.value); setGiftCardStatus(null); }}
                className="flex-1 rounded-sm border border-line bg-surface px-4 py-2.5 text-sm uppercase"
              />
              <button onClick={checkGiftCard} className="rounded-sm border border-line px-4 py-2.5 text-sm">
                Vérifier
              </button>
            </div>
            {giftCardStatus && (
              <p className={`mt-1 text-sm ${giftCardStatus.valid ? "text-accent" : "text-ink-soft"}`}>
                {giftCardStatus.message}
              </p>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-accent">{error}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => submit(false)}
              disabled={isPending || !form.firstName || !form.lastName || (!form.email && !form.phone)}
              className="rounded-sm border border-line px-8 py-3.5 text-sm font-medium transition hover:border-ink-soft disabled:opacity-50"
            >
              {isPending ? "…" : "Payer sur place"}
            </button>
            {paymentsEnabled && (
              <button
                onClick={() => submit(true)}
                disabled={isPending || !form.firstName || !form.lastName || (!form.email && !form.phone)}
                className="rounded-sm bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
              >
                {isPending ? "…" : "Payer en ligne maintenant"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
