import Link from "next/link";
import { absoluteUrl, site } from "@/lib/site";
import { breadcrumbs } from "@/lib/seo";
import type { PublicGuide } from "@/lib/public-guides";
import NavBarMenu from "../ui/NavBarMenu";
import { SiteFooter } from "../ui/SiteFooter";

export function GuidePage({ guide }: { guide: PublicGuide }) {
  const path = `/${guide.slug}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": absoluteUrl(`${path}#webpage`),
      url: absoluteUrl(path),
      name: guide.title,
      description: guide.description,
      inLanguage: site.language,
      dateModified: guide.updated,
      isPartOf: { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: site.name, url: site.url },
      author: { "@type": "Organization", name: site.name, url: absoluteUrl("/sobre") },
    },
    breadcrumbs([{ name: site.name, path: "/" }, { name: guide.label, path }]),
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-[#f4ecdf]">
      <NavBarMenu />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28 sm:px-10 sm:pt-36">
        <nav aria-label="Caminho da página" className="text-sm text-[#c7c2b9]">
          <Link href="/" className="underline underline-offset-4 hover:text-[#e1bd8a]">SugarMimo</Link>
          <span aria-hidden="true"> / </span><span aria-current="page">{guide.label}</span>
        </nav>
        <header className="max-w-4xl pb-12 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e1bd8a]">Informação e escolhas conscientes</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{guide.title.replace(/ \| SugarMimo$/, "")}</h1>
          <p className="mt-7 text-lg leading-8 text-[#d0c9be]">{guide.intro}</p>
          <p className="mt-5 text-sm text-[#aba49a]">Por <Link href="/sobre" className="underline underline-offset-4">Equipe SugarMimo</Link> · Atualizado em <time dateTime={guide.updated}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${guide.updated}T12:00:00Z`))}</time></p>
        </header>
        <div className="grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Neste guia" className="rounded-2xl border border-[#e1bd8a]/25 bg-[#11100e] p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-xl text-[#e1bd8a]">Neste guia</h2>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-[#c7c2b9]">
              {guide.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="underline decoration-[#e1bd8a]/30 underline-offset-4 hover:text-[#e1bd8a]">{section.heading}</a></li>)}
              <li><a href="#duvidas" className="underline decoration-[#e1bd8a]/30 underline-offset-4">Perguntas frequentes</a></li>
            </ul>
          </nav>
          <article className="min-w-0">
            {guide.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-28">
                <h2 className="font-serif text-3xl leading-tight">{section.heading}</h2>
                {section.paragraphs.map((text) => <p key={text} className="mt-5 text-base leading-8 text-[#c7c2b9]">{text}</p>)}
                {section.points && <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8 text-[#c7c2b9]">{section.points.map((text) => <li key={text}>{text}</li>)}</ul>}
              </section>
            ))}
            <section id="duvidas" className="scroll-mt-28 border-t border-[#e1bd8a]/20 pt-10">
              <h2 className="font-serif text-3xl">Perguntas frequentes</h2>
              {guide.questions.map((item) => <div key={item.question} className="mt-7"><h3 className="text-lg font-semibold text-[#e1bd8a]">{item.question}</h3><p className="mt-3 leading-8 text-[#c7c2b9]">{item.answer}</p></div>)}
            </section>
            <aside className="mt-12 rounded-2xl border border-[#e1bd8a]/25 bg-[#11100e] p-7">
              <h2 className="font-serif text-2xl">Continue a leitura</h2>
              <ul className="mt-4 space-y-3">{guide.related.map((link) => <li key={link.href}><Link href={link.href} className="text-[#e1bd8a] underline underline-offset-4">{link.label}</Link></li>)}</ul>
            </aside>
            <section className="mt-12 border-t border-[#e1bd8a]/20 pt-10">
              <h2 className="font-serif text-3xl">Conheça a SugarMimo</h2>
              <p className="mt-4 leading-8 text-[#c7c2b9]">Crie seu perfil e conheça os recursos da plataforma. Cadastro exclusivo para maiores de 18 anos, sujeito às condições do serviço.</p>
              <div className="mt-6 flex flex-wrap gap-4"><Link href="/register" className="sm-luxury-button">Criar meu perfil</Link><Link href="/como-funciona" className="sm-outline-button">Como funciona</Link></div>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
