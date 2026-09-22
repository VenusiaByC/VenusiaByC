import { getSiteSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";
import { GiftCardPurchaseForm } from "@/components/GiftCardPurchaseForm";

export default async function CarteCadeauPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-7 py-5">
        <a href="/" className="inline-block">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" />
        </a>
      </header>
      <div className="px-7 py-14">
        <h1 className="mb-2 text-center font-serif text-4xl italic">Carte cadeau</h1>
        <p className="mb-10 text-center text-ink-soft">Le cadeau parfait, à utiliser comme elle veut.</p>
        <GiftCardPurchaseForm />
      </div>
    </main>
  );
}
