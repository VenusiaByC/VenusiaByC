import crypto from "crypto";

/** Génère un code de carte cadeau lisible, ex: VEN-7K2P-9QXM. */
export function generateGiftCardCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I/O/0/1 pour éviter les confusions
  function segment(length: number) {
    return Array.from({ length }, () => alphabet[crypto.randomInt(alphabet.length)]).join("");
  }
  return `VEN-${segment(4)}-${segment(4)}`;
}
