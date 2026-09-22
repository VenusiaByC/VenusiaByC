import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "🏠" },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: "📅" },
  { href: "/admin/calendrier", label: "Calendrier", icon: "🗓️" },
  { href: "/admin/clientes", label: "Clientes", icon: "👩" },
  { href: "/admin/prestations", label: "Prestations", icon: "💅" },
  { href: "/admin/galerie", label: "Galerie", icon: "🖼️" },
  { href: "/admin/avis", label: "Avis", icon: "⭐" },
  { href: "/admin/cartes-cadeaux", label: "Cartes cadeaux", icon: "🎁" },
  { href: "/admin/horaires", label: "Horaires", icon: "🕐" },
  { href: "/admin/indisponibilites", label: "Indisponibilités", icon: "🚫" },
  { href: "/admin/emails", label: "E-mails", icon: "✉️" },
  { href: "/admin/sms", label: "SMS", icon: "📱" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg md:flex">
      <aside className="border-b border-line bg-surface px-4 py-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r md:px-5 md:py-8">
        <div className="mb-6 px-2 font-serif text-xl italic">Venusia — Admin</div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm text-ink-soft transition hover:bg-blush hover:text-ink md:whitespace-normal"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
