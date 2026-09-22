export default function CarteCadeauMerciPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-7 text-center">
      <div>
        <h1 className="mb-4 font-serif text-3xl italic text-accent">Merci pour ton achat !</h1>
        <p className="text-ink-soft">Le code de la carte cadeau arrive par e-mail dans quelques instants.</p>
        <a href="/" className="mt-6 inline-block text-sm underline text-ink-soft">Retour à l'accueil</a>
      </div>
    </main>
  );
}
