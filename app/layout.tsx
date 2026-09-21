import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.brand_name} — Prothésiste ongulaire`,
    description: settings.hero_subtitle,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSiteSettings();

  // Les couleurs/polices viennent de la base (table `settings`). On les
  // injecte ici en variables CSS : aucune page n'a besoin de connaître les
  // valeurs, elle utilise juste var(--color-accent) etc.
  const themeStyle = `
    :root {
      --color-bg: ${s.color_bg};
      --color-surface: ${s.color_surface};
      --color-ink: ${s.color_ink};
      --color-ink-soft: ${s.color_ink_soft};
      --color-accent: ${s.color_accent};
      --color-accent-dark: ${s.color_accent_dark};
      --color-blush: ${s.color_blush};
      --color-gold: ${s.color_gold};
      --color-line: rgba(43,28,34,0.10);
      --font-serif: "${s.font_serif}", serif;
      --font-sans: "${s.font_sans}", sans-serif;
    }
  `;

  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        {/* Les polices sont chargées dynamiquement selon le réglage choisi.
            Si la propriétaire change de police depuis l'admin, il suffira
            d'ajouter son nom ici (étape documentée dans le README). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(s.font_serif)}:ital,wght@0,300..600;1,400..500&family=${encodeURIComponent(s.font_sans)}:wght@300;400;500;600&display=swap`} rel="stylesheet" />
      </head>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
