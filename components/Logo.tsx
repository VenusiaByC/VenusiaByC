import Image from "next/image";

// Tant qu'aucun logo n'est uploadé depuis l'admin (logo_url vide), on
// affiche le nom en toutes lettres avec la typographie de marque. Dès
// qu'un logo est ajouté, il prend automatiquement le relais ici — sur
// tout le site, sans rien modifier dans le code.
export function Logo({
  brandName,
  logoUrl,
  className = "",
  size = "md",
}: {
  brandName: string;
  logoUrl: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const heights = { sm: "h-10", md: "h-16", lg: "h-24" };
  const textSizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" };

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={brandName}
        width={280}
        height={140}
        className={`${heights[size]} w-auto object-contain ${className}`}
        priority
      />
    );
  }

  return (
    <span className={`font-serif italic ${textSizes[size]} ${className}`}>
      {brandName}
    </span>
  );
}
