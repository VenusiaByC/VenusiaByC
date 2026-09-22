import { LegalLayout } from "@/components/LegalLayout";
import { getSiteSettings } from "@/lib/settings";

export default async function ConfidentialitePage() {
  const settings = await getSiteSettings();

  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        La présente politique de confidentialité décrit comment {settings.brand_name} collecte,
        utilise et protège les données personnelles des visiteuses et clientes du site,
        conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
        Informatique et Libertés.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est {settings.brand_name}, joignable à l'adresse{" "}
        {settings.contact_email || "[e-mail à compléter]"}.
      </p>

      <h2>2. Données collectées</h2>
      <p>Selon vos interactions avec le site, nous collectons :</p>
      <ul>
        <li>Prénom, nom, e-mail, numéro de téléphone (lors d'une réservation) ;</li>
        <li>Adresse, si renseignée ;</li>
        <li>Historique des rendez-vous pris (prestations, dates, statuts) ;</li>
        <li>
          En cas de paiement en ligne : aucune donnée bancaire n'est stockée par nos soins, celles-ci
          sont traitées directement et exclusivement par notre prestataire Stripe ;
        </li>
        <li>Avis et commentaires que vous choisissez de publier ;</li>
        <li>
          Notes internes éventuellement ajoutées par l'institut à votre dossier (jamais visibles
          par vous ni transmises à des tiers, à usage strictement interne).
        </li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>
          <strong>Gestion des réservations</strong> (prise, confirmation, modification, annulation
          de rendez-vous) — exécution du contrat de prestation de services ;
        </li>
        <li>
          <strong>Envoi d'e-mails et SMS liés au rendez-vous</strong> (confirmation, rappel,
          annulation) — exécution du contrat ;
        </li>
        <li>
          <strong>Programme de fidélité</strong>, si activé — intérêt légitime, base du consentement
          implicite à la réservation ;
        </li>
        <li>
          <strong>Amélioration du service et statistiques internes</strong> — intérêt légitime de
          l'institut.
        </li>
      </ul>

      <h2>4. Destinataires des données</h2>
      <p>
        Vos données ne sont jamais vendues ni cédées à des fins commerciales. Elles sont partagées
        uniquement avec les prestataires techniques nécessaires au fonctionnement du site, chacun
        agissant en tant que sous-traitant au sens du RGPD :
      </p>
      <ul>
        <li><strong>Supabase</strong> — hébergement de la base de données (serveurs situés dans l'Union européenne) ;</li>
        <li><strong>Vercel</strong> — hébergement du site ;</li>
        <li><strong>Brevo</strong> — envoi des SMS de confirmation et de rappel ;</li>
        <li><strong>Stripe</strong> — traitement sécurisé des paiements en ligne, si vous choisissez ce mode de règlement ;</li>
        <li>Notre service de messagerie, pour l'envoi des e-mails de confirmation.</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <p>
        Les données liées à votre dossier client (coordonnées, historique de rendez-vous) sont
        conservées pendant la durée de la relation commerciale, puis archivées ou supprimées
        conformément aux délais légaux applicables (notamment en matière comptable). Vous pouvez
        demander la suppression de vos données à tout moment (voir section 6).
      </p>

      <h2>6. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
      <ul>
        <li>Droit d'accès et de rectification ;</li>
        <li>Droit à l'effacement ("droit à l'oubli") ;</li>
        <li>Droit à la limitation du traitement ;</li>
        <li>Droit d'opposition ;</li>
        <li>Droit à la portabilité de vos données.</li>
      </ul>
      <p>
        Pour exercer l'un de ces droits, contactez-nous à l'adresse{" "}
        {settings.contact_email || "[e-mail à compléter]"}. Nous nous engageons à répondre dans
        un délai maximal d'un mois. Vous disposez également du droit d'introduire une réclamation
        auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) —{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Ce site n'utilise pas de cookies de suivi publicitaire ni d'outils d'analyse tiers. Seuls
        des cookies strictement nécessaires au fonctionnement technique du site (par exemple pour
        maintenir votre session lors d'un paiement) peuvent être utilisés.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données :
        connexions chiffrées (HTTPS), mots de passe hashés, accès restreint aux données
        administratives, et hébergement chez des prestataires reconnus pour leurs standards de
        sécurité.
      </p>

      <h2>9. Contact</h2>
      <p>
        Pour toute question relative à cette politique de confidentialité, contactez-nous à{" "}
        {settings.contact_email || "[e-mail à compléter]"}.
      </p>
    </LegalLayout>
  );
}
