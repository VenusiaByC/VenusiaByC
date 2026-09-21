import Image from "next/image";

// Tant qu'aucun logo n'est uploadé depuis l'admin (logo_url vide), on
// affiche le nom en toutes lettres avec la typographie de marque. Dès
// qu'un logo est ajouté, il prend automatiquement le relais ici — sur
// tout le site, sans rien modifier dans le code.
export function Logo({
  brandName,
  logoUrl,
  className = "",
}: {
  brandName: string;
  logoUrl: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={brandName}
        width={140}
        height={48}
        className={`h-10 w-auto object-contain ${className}`}
        priority
      />
    );
  }

  return (
    <span className={`font-serif italic text-2xl ${className}`}>
      {brandName}
    </span>
  );
}
