import nodemailer from "nodemailer";

/**
 * Envoie les e-mails depuis l'adresse professionnelle de la propriétaire,
 * via ses propres identifiants SMTP (jamais un service générique tiers).
 * Les identifiants viennent uniquement des variables d'environnement,
 * jamais codés en dur ici — voir .env.example.
 */
function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = connexion chiffrée dès le départ (SSL), 587 = TLS via STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return { ok: false, error: "Configuration SMTP manquante (variables d'environnement)" };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Venusia"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi inconnue" };
  }
}
