"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-sm border border-line bg-surface p-8">
        <h1 className="mb-6 font-serif text-2xl italic">Espace admin — Venusia</h1>
        <label className="mb-1 block text-sm text-ink-soft">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-sm border border-line px-4 py-2.5"
        />
        <label className="mb-1 block text-sm text-ink-soft">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-sm border border-line px-4 py-2.5"
        />
        {error && <p className="mb-4 text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
