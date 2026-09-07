import Link from "next/link";
import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";
import { absoluteUrl, site } from "@/lib/site";
import { breadcrumbs, publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Sobre a SugarMimo: plataforma e equipe editorial", "Conheça a SugarMimo, a empresa responsável, os canais oficiais e a proposta dos conteúdos sobre relacionamentos sugar entre adultos.", "/sobre");

export default function AboutPage() {
  const data = [{ "@context": "https://schema.org", "@type": "AboutPage", url: absoluteUrl("/sobre"), name: "Sobre a SugarMimo", mainEntity: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: site.name, legalName: site.legalName, taxID: site.taxId, url: site.url, email: site.email } }, breadcrumbs([{ name: site.name, path: "/" }, { name: "Sobre", path: "/sobre" }])];
  return (
    <div className="min-h-screen bg-[#080808] text-[#f4ecdf]">
      <NavBarMenu />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 sm:px-10">
        <nav aria-label="Caminho da página" className="text-sm text-[#c7c2b9]"><Link href="/" className="underline">SugarMimo</Link> / <span aria-current="page">Sobre</span></nav>
        <h1 className="mt-8 font-serif text-4xl sm:text-5xl">Sobre a SugarMimo</h1>
        <p className="mt-6 text-lg leading-8 text-[#c7c2b9]">A SugarMimo é uma plataforma de relacionamento sugar para adultos que valorizam transparência, privacidade e liberdade de escolha. Oferece perfis, busca, chat e recursos de moderação e controle de informações pessoais.</p>
        <section className="mt-12"><h2 className="font-serif text-3xl">Quem é responsável pelo serviço</h2><p className="mt-5 leading-8 text-[#c7c2b9]">A plataforma é administrada por {site.legalName}, CNPJ {site.taxId}. As condições de acesso, de contratação e de uso estão nos <Link href="/terms" className="text-[#e1bd8a] underline">Termos de Uso</Link>. O serviço é exclusivo para maiores de 18 anos.</p></section>
        <section className="mt-12"><h2 className="font-serif text-3xl">Conteúdo da Equipe SugarMimo</h2><p className="mt-5 leading-8 text-[#c7c2b9]">Os guias e artigos assinados pela Equipe SugarMimo são conteúdos institucionais sobre a plataforma, expectativas em relacionamentos e cuidados ao conhecer pessoas. A autoria representa a organização, sem atribuição a especialistas externos.</p><p className="mt-5 leading-8 text-[#c7c2b9]">O material é informativo. Não oferece garantia de segurança, renda ou sucesso em relacionamentos. Informações sobre o produto devem ser conferidas com as condições apresentadas na conta e nos documentos do serviço. Caso encontre uma informação incorreta, entre em contato para solicitar uma revisão.</p></section>
        <section className="mt-12"><h2 className="font-serif text-3xl">Canais oficiais</h2><ul className="mt-5 space-y-4 leading-7 text-[#c7c2b9]"><li>Atendimento: <a href={`mailto:${site.email}`} className="break-words text-[#e1bd8a] underline">{site.email}</a></li><li>Privacidade: <a href={`mailto:${site.privacyEmail}`} className="break-words text-[#e1bd8a] underline">{site.privacyEmail}</a></li><li>Denúncias: <a href={`mailto:${site.reportEmail}`} className="break-words text-[#e1bd8a] underline">{site.reportEmail}</a></li></ul><div className="mt-8 flex flex-wrap gap-4"><Link href="/atendimento" className="sm-luxury-button">Acessar atendimento</Link><Link href="/seguranca" className="sm-outline-button">Segurança e privacidade</Link></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
