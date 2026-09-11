import { readFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = process.argv[2] ? new URL(process.argv[2]) : null;

async function getText(url, contentType) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get("content-type")?.includes(contentType)) {
    throw new Error(`${url}: esperado ${contentType}, recebido HTTP ${response.status}.`);
  }
  return response.text();
}

async function checkRoute(route) {
  const html = origin
    ? await getText(new URL(route, origin), "text/html")
    : await readFile(resolve(root, `.next/server/app${route}.html`), "utf8");
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .filter(([tag]) => /\brel="stylesheet"/.test(tag))
    .map(([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&"))
    .filter(Boolean);
  if (!links.length) throw new Error(`${route}: nenhum CSS vinculado à página.`);

  const css = (await Promise.all([...new Set(links)].map(async (href) => {
    if (origin) return getText(new URL(href, origin), "text/css");
    const pathname = new URL(href, "http://localhost").pathname;
    if (!pathname.startsWith("/_next/static/")) throw new Error(`CSS inesperado: ${href}`);
    const file = resolve(root, `.next/${pathname.slice("/_next/".length)}`);
    if (!file.startsWith(resolve(root, ".next/static") + sep)) throw new Error(`Caminho de CSS inválido: ${href}`);
    return readFile(file, "utf8");
  }))).join("\n");

  for (const marker of ["message", "progress"]) {
    const tags = [...html.matchAll(/<[^>]+>/g)]
      .map(([tag]) => tag)
      .filter(tag => tag.includes(`data-form-feedback="${marker}"`));
    if (!tags.length) throw new Error(`${route}: componente ${marker} desatualizado ou ausente. Confira o build e o processo em execução.`);
    for (const tag of tags) {
      const className = tag.match(/\bclass="([^"]+)"/)?.[1];
      if (!className || !css.includes(`.${className}`)) {
        throw new Error(`${route}: o CSS do componente ${marker} não foi incluído. Não publique este build.`);
      }
    }
  }
  console.log(`CSS de ${route}: OK (${links.length} arquivos vinculados).`);
}

try {
  await checkRoute("/login");
  await checkRoute("/register");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
