// These pages contain information, not member data. Registration and account
// routes keep age confirmation and their existing authentication checks.
const publicInformationPaths = new Set([
  "/", "/blog", "/sugar-baby", "/sugar-daddy", "/relacionamento-sugar",
  "/como-funciona", "/seguranca", "/sobre", "/atendimento", "/contato",
  "/privacy", "/terms", "/manutencao",
]);

export function isPublicInformationPath(pathname: string) {
  return publicInformationPaths.has(pathname) || pathname.startsWith("/blog/");
}
