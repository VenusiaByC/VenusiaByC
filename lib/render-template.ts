/** Remplace les {{variables}} par leurs valeurs dans un texte. Partagé par
 * les modèles d'e-mail et de SMS. */
export function renderTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] ?? "");
}
