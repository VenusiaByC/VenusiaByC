import { LegalLayout } from "@/components/LegalLayout";
import { getSiteSettings } from "@/lib/settings";

export default async function CGVPage() {
  const settings = await getSiteSettings();

  return (
    <LegalLayout title="Conditions générales de vente">
      <p>
        Les présentes conditions générales de vente (CGV) régissent les relations contractuelles
        entre {settings.brand_name} (ci-après "l'institut") et toute personne réservant une
        prestation via le site {settings.site_url || "[nom de domaine]"} (ci-après "la cliente").
        Toute réservation implique l'acceptation sans réserve des présentes CGV.
      </p>

      <h2>1. Prestations et tarifs</h2>
      <p>
        Les prestations proposées, leurs descriptions, durées et tarifs sont présentés sur le
        site et peuvent être modifiés à tout moment. Les tarifs applicables sont ceux en vigueur
        au moment de la réservation, exprimés en euros, toutes taxes comprises.
      </p>

      <h2>2. Réservation</h2>
      <p>
        La réservation s'effectue en ligne via le site, en sélectionnant une prestation, une date
        et un créneau horaire disponible, puis en renseignant ses coordonnées. Un e-mail de
        confirmation est envoyé automatiquement à l'adresse indiquée. La réservation peut
        également être effectuée par téléphone ou directement en institut.
      </p>

      <h2>3. Paiement</h2>
      <p>
        Le règlement des prestations s'effectue au choix de la cliente :
      </p>
      <ul>
        <li>en institut, le jour du rendez-vous, par les moyens de paiement acceptés sur place ;</li>
        <li>
          en ligne au moment de la réservation, par carte bancaire, via notre prestataire de
          paiement sécurisé Stripe. {settings.brand_name} n'a à aucun moment accès aux données
          bancaires de la cliente, celles-ci étant traitées directement par Stripe.
        </li>
      </ul>
      <p>
        En cas de paiement en ligne, une confirmation de paiement est envoyée automatiquement
        et le rendez-vous est considéré comme réglé à l'avance.
      </p>

      <h2>4. Cartes cadeaux</h2>
      <p>
        Les cartes cadeaux achetées sur le site sont valables un an à compter de leur date
        d'achat, sauf mention contraire. Elles sont utilisables en une ou plusieurs fois, dans la
        limite du solde disponible, et ne sont ni remboursables ni échangeables contre des
        espèces. En cas de perte du code, la cliente est invitée à contacter l'institut avec une
        preuve d'achat.
      </p>

      <h2>5. Annulation et modification</h2>
      <p>
        Chaque rendez-vous peut être annulé ou modifié directement en ligne, via le lien présent
        dans l'e-mail de confirmation, jusqu'à <strong>{settings.min_cancellation_hours} heures</strong>{" "}
        avant l'heure du rendez-vous. Passé ce délai, toute annulation ou modification doit être
        demandée directement auprès de l'institut par téléphone ou e-mail.
      </p>
      <p>{settings.cancellation_policy}</p>
      <p>
        En cas d'absence non signalée ("no-show") à un rendez-vous confirmé, {settings.brand_name}{" "}
        se réserve le droit de demander un règlement à l'avance pour toute réservation future.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        La cliente s'engage à communiquer des informations exactes lors de sa réservation
        (coordonnées, éventuelles allergies ou contre-indications). {settings.brand_name} ne
        saurait être tenue responsable d'une réaction liée à une information non communiquée.
      </p>

      <h2>7. Réclamations et médiation</h2>
      <p>
        Pour toute réclamation, la cliente peut contacter l'institut à l'adresse{" "}
        {settings.contact_email || "[e-mail à compléter]"}. Conformément à l'article L.616-1 du
        Code de la consommation, en cas de litige non résolu, la cliente peut recourir
        gratuitement à un médiateur de la consommation. [Nom et coordonnées du médiateur à
        compléter — voir mediateur-conso.fr pour trouver le médiateur compétent selon votre
        secteur].
      </p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes CGV sont soumises au droit français.</p>
    </LegalLayout>
  );
}
