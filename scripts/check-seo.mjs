// Read-only checks against a running production build or the public site.
// npm run seo:check -- http://127.0.0.1:3107
import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

const base = new URL(process.argv[2] || "http://127.0.0.1:3107");
const canonicalOrigin = "https://sugarmimo.com";
const agent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const errors = [];
let checks = 0;
const request = (path, options = {}) => fetch(new URL(path, base), {
  redirect: "manual", signal: AbortSignal.timeout(30000),
  ...options, headers: { "User-Agent": agent, ...options.headers },
});
function verify(condition, message) {
  checks++;
  if (!condition) errors.push(message);
}
function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}
function meta(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(([tag]) => attr(tag, "name") === name).map(([tag]) => attr(tag, "content"));
}
const sitemapResponse = await request("/sitemap.xml");
assert.equal(sitemapResponse.status, 200, "Sitemap must return 200");
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.ok(urls.length, "Sitemap cannot be empty");
verify(new Set(urls).size === urls.length, "Sitemap contains duplicate URLs");
for (const path of ["/sugar-baby", "/sugar-daddy", "/relacionamento-sugar", "/como-funciona", "/seguranca", "/sobre"]) {
  verify(urls.includes(canonicalOrigin + path), `Missing from sitemap: ${path}`);
}
const robotsResponse = await request("/robots.txt");
const robots = await robotsResponse.text();
verify(robotsResponse.status === 200, "robots.txt must return 200");
verify(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), "robots.txt sitemap differs from canonical domain");
const disallows = [...robots.matchAll(/^Disallow:\s*(.*)$/gm)].map((match) => match[1].trim());
const titles = new Set();
const descriptions = new Set();
const assets = new Set();
const htmlByPath = new Map();

for (const url of urls) {
  const parsed = new URL(url);
  const path = parsed.pathname;
  verify(parsed.origin === canonicalOrigin, `Non-canonical origin: ${url}`);
  verify(!disallows.some((rule) => rule && (rule.endsWith("$") ? path === rule.slice(0, -1) : path.startsWith(rule))), `Public page blocked in robots: ${path}`);
  const response = await request(path);
  const html = await response.text();
  htmlByPath.set(path, html);
  verify(response.status === 200, `${path} returned ${response.status}`);
  const directives = [response.headers.get("x-robots-tag") || "", ...meta(html, "robots"), ...meta(html, "googlebot")].join(",");
  verify(!/\b(noindex|none)\b/i.test(directives), `${path} is marked noindex`);
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)].filter(([tag]) => attr(tag, "rel") === "canonical").map(([tag]) => attr(tag, "href"));
  verify(canonicals.length === 1 && canonicals[0] === url, `${path} canonical mismatch: ${canonicals}`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  verify(Boolean(title) && !titles.has(title), `${path} missing or duplicate title`);
  titles.add(title);
  const description = meta(html, "description");
  verify(description.length === 1 && Boolean(description[0]) && !descriptions.has(description[0]), `${path} missing or duplicate description`);
  descriptions.add(description[0]);
  verify((html.match(/<h1\b/gi) || []).length === 1, `${path} must have one server-rendered H1`);
  verify(html.includes('lang="pt-BR"'), `${path} language is not pt-BR`);
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); checks++; } catch { errors.push(`${path} has invalid JSON-LD`); }
  }
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attr(match[0], "property") === "og:image") assets.add(attr(match[0], "content"));
  }
  console.log(`CHECK ${path}: HTTP ${response.status}, canonical ${canonicals[0] || "missing"}`);
}
for (const image of sitemap.matchAll(/<image:loc>(.*?)<\/image:loc>/g)) assets.add(image[1]);
for (const asset of assets) {
  const url = new URL(asset, canonicalOrigin);
  verify(url.origin === canonicalOrigin, `Unexpected image origin: ${url}`);
  if (url.origin === canonicalOrigin) {
    const response = await request(url.pathname, { method: "HEAD" });
    verify(response.status === 200 && /image\//.test(response.headers.get("content-type") || ""), `Missing image: ${url.pathname}`);
  }
}
for (const path of ["/sugar-baby", "/sugar-daddy", "/relacionamento-sugar"]) {
  for (const source of ["/", "/blog"]) verify(htmlByPath.get(source)?.includes(`href="${path}"`), `${source} missing internal link to ${path}`);
}
for (const path of ["/login", "/register", "/register/basic-info", "/reset-password", "/perfil", "/perfil/seo-check-nonexistent", "/chat", "/inicio", "/buscar", "/pins", "/notificacoes", "/configuracoes", "/clube-vip", "/planos", "/checkout/premiere", "/admin/login"]) {
  const response = await request(path, { method: "HEAD" });
  verify(/noindex/.test(response.headers.get("x-robots-tag") || ""), `${path} missing X-Robots-Tag noindex`);
  verify(!disallows.some((rule) => rule && path.startsWith(rule)), `${path} blocks crawler from reading noindex`);
  verify(!urls.includes(canonicalOrigin + path), `${path} must not be in sitemap`);
}
for (const path of ["/seo-check-nonexistent", "/blog/seo-check-nonexistent"]) {
  const response = await request(path);
  verify(response.status === 404, `${path} must return a real 404, got ${response.status}`);
}
// Simulate the canonical redirect locally, test the actual www host in production.
const redirectResponse = base.origin === canonicalOrigin
  ? await fetch("https://www.sugarmimo.com/blog?seo_check=1", { redirect: "manual", signal: AbortSignal.timeout(30000) })
  : await new Promise((resolve, reject) => {
    // Node fetch may ignore a custom Host header; use the HTTP client for this one check.
    const transport = base.protocol === "https:" ? https : http;
    const req = transport.get(new URL("/blog?seo_check=1", base), {
      headers: { Host: "www.sugarmimo.com", "User-Agent": agent },
      signal: AbortSignal.timeout(30000),
    }, (response) => {
      response.resume();
      resolve({ status: response.statusCode, headers: new Headers(response.headers) });
    });
    req.on("error", reject);
  });
verify([301, 308].includes(redirectResponse.status), "www must permanently redirect");
verify(redirectResponse.headers.get("location") === `${canonicalOrigin}/blog?seo_check=1`, "www redirect must preserve path and query");
console.log(`\n${urls.length} public pages; ${checks} checks; ${errors.length} failures.`);
if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exitCode = 1;
}
