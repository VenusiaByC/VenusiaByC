import Stripe from "stripe";

/**
 * Client Stripe — utilisé uniquement côté serveur (Server Actions, Route
 * Handlers). La clé secrète ne doit jamais apparaître côté navigateur.
 */
export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}
