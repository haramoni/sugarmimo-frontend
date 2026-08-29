export const site = {
  name: "SugarMimo",
  alternateName: "Sugar Mimo",
  url: "https://sugarmimo.com",
  legalName: "SPARKBRIDGE VENTURES",
  taxId: "68.573.395/0001-55",
  description:
    "Clube de relacionamento sugar para adultos, com perfis moderados, privacidade, consentimento e intenções claras.",
  email: "contato@sugarmimo.com",
  privacyEmail: "privacidade@sugarmimo.com",
  reportEmail: "denuncia@sugarmimo.com",
  telephone: "+55 11 99775-2731",
  locale: "pt_BR",
  language: "pt-BR",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
