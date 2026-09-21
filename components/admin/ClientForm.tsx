"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveClient, deleteClient, type ClientInput } from "@/app/actions/admin-clients";

export function ClientForm({ initial }: { initial?: ClientInput }) {
  const router = useRouter();
  const [form, setForm] = useState<ClientInput>(
    initial ?? {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      internal_notes: "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveClient(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/clientes");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    if (!confirm(`Supprimer définitivement ${form.first_name} ${form.last_name} ? Ses rendez-vous seront aussi supprimés.`)) return;
    const result = await deleteClient(form.id);
    if (result.ok) {
      router.push("/admin/clientes");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-ink-soft">Prénom</label>
          <input
            required
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">Nom</label>
          <input
            required
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-soft">Adresse</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-soft">
            Notes internes <span className="text-xs">(jamais visibles par la cliente)</span>
          </label>
          <textarea
            value={form.internal_notes}
            onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
            rows={3}
            className="w-full rounded-sm border border-line bg-surface px-4 py-2.5"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-sm border border-line px-7 py-3 text-sm text-ink-soft transition hover:border-accent hover:text-accent"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
