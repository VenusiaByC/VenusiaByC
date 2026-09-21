import type { Config } from "tailwindcss";

// IMPORTANT : les couleurs et polices ne sont pas des valeurs fixes ici.
// Elles pointent vers des variables CSS (--color-bg, --color-accent, etc.)
// définies dans app/globals.css et injectées dynamiquement depuis la table
// `settings` de la base de données (voir lib/settings.ts).
// Cela permet à la propriétaire de changer ses couleurs/polices depuis
// l'admin, sans jamais toucher au code.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        accent: "var(--color-accent)",
        "accent-dark": "var(--color-accent-dark)",
        blush: "var(--color-blush)",
        gold: "var(--color-gold)",
        line: "var(--color-line)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
