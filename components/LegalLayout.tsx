import { getSiteSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";

export async function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-7 py-5">
        <a href="/" className="inline-block">
          <Logo brandName={settings.brand_name} logoUrl={settings.logo_url} size="sm" />
        </a>
      </header>
      <div className="mx-auto max-w-2xl px-7 py-14">
        <h1 className="mb-10 font-serif text-4xl italic">{title}</h1>
        <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink-soft [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-ink [&_h2]:font-serif [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_strong]:text-ink [&_strong]:font-medium [&_a]:underline">
          {children}
        </div>
      </div>
    </main>
  );
}
