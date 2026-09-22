import { LegalLayout } from "@/components/LegalLayout";
import { getSiteSettings } from "@/lib/settings";

export default async function MentionsLegalesPage() {
  const settings = await getSiteSettings();

  return (
    <LegalLayout title="Mentions légales">
      <p>
        Conformément aux articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la
        Confiance dans l'Économie Numérique (LCEN), il est précisé aux utilisateurs du site{" "}
        {settings.brand_name} l'identité des différents intervenants dans le cadre de sa
        réalisation et de son suivi.
      </p>

      <h2>Éditrice du site</h2>
      <p>
        <strong>Nom / raison sociale :</strong> Venusia By C
        <br />
        <strong>Statut :</strong> Micro-entreprise
        <br />
        <strong>SIRET :</strong> 983 308 883 00039
        <br />
        <strong>Adresse :</strong> {settings.contact_address || "4 rue Léon Belton, 10250 Mussy-sur-Seine"}
        <br />
        <strong>E-mail :</strong> {settings.contact_email || "venusiabyc@gmail.com"}
        <br />
        <strong>Téléphone :</strong> {settings.contact_phone || "06 81 99 30 29"}
        <br />
        <strong>TVA :</strong> Non applicable, article 293 B du Code Général des Impôts (franchise en base de TVA)
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :
        <br />
        <strong>Vercel Inc.</strong>
        <br />
        340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
        <br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
      </p>
      <p>
        La base de données est hébergée par <strong>Supabase Inc.</strong> (
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
        ), sur des serveurs situés dans l'Union européenne.
      </p>

      <h2>Directrice de la publication</h2>
      <p>Célia Nicolas</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus présents sur ce site (textes, photographies, logo, charte
        graphique) est la propriété exclusive de {settings.brand_name}, sauf mention contraire.
        Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est
        interdite sans autorisation écrite préalable.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au site, vous pouvez nous contacter à l'adresse :{" "}
        {settings.contact_email || "[à compléter]"}.
      </p>
    </LegalLayout>
  );
}
