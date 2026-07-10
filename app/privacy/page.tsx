import type { Metadata } from "next";
import Link from "next/link";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";

export const metadata: Metadata = {
  title: "Politica de Privacidade | SugarMimo",
  description: "Politica de Privacidade da plataforma SugarMimo.",
};

const privacySections = [
  {
    title: "Dados que coletamos",
    paragraphs: [
      "Coletamos as informacoes fornecidas durante o cadastro, como nome de usuario, e-mail, data de nascimento, localizacao, tipo de perfil, preferencias, fotos e respostas do formulario.",
      "Tambem podemos registrar dados tecnicos, como endereco IP, identificadores de sessao, cookies essenciais, data de acesso e informacoes do dispositivo para seguranca e funcionamento da plataforma.",
    ],
  },
  {
    title: "Como usamos os dados",
    paragraphs: [
      "Usamos os dados para criar e proteger sua conta, exibir perfis, apoiar a curadoria da comunidade, prevenir abuso, cumprir obrigacoes legais e melhorar a experiencia do usuario.",
      "Informacoes sensiveis de contato, como e-mail, nao sao exibidas publicamente no perfil.",
    ],
  },
  {
    title: "Compartilhamento",
    paragraphs: [
      "Nao vendemos dados pessoais. Podemos compartilhar informacoes apenas com fornecedores necessarios para operacao do servico, autoridades competentes quando exigido por lei ou em situacoes necessarias para proteger usuarios e a plataforma.",
    ],
  },
  {
    title: "Seguranca e retencao",
    paragraphs: [
      "Adotamos medidas tecnicas e administrativas para reduzir riscos de acesso indevido, perda, alteracao ou divulgacao nao autorizada.",
      "Mantemos os dados pelo tempo necessario para prestar o servico, atender obrigacoes legais, resolver disputas e proteger a comunidade.",
    ],
  },
  {
    title: "Seus direitos",
    paragraphs: [
      "Voce pode solicitar acesso, correcao, exclusao, portabilidade ou revisao do tratamento dos seus dados, conforme a legislacao aplicavel.",
      "Para exercer seus direitos, entre em contato pelo canal indicado no rodape do site.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[url('/wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-extrabold uppercase tracking-normal text-gold">
            SugarMimo
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
            Politica de Privacidade
          </h1>
          <p className="mt-5 text-base font-medium leading-8 text-black-jewel/76 sm:text-lg">
            Esta politica explica como tratamos dados pessoais na plataforma
            SugarMimo. A plataforma e exclusiva para adultos e deve ser usada
            apenas por pessoas com 18 anos ou mais.
          </p>
          <p className="mt-4 text-sm font-semibold text-black-jewel/60">
            Ultima atualizacao: 6 de julho de 2026
          </p>
        </div>
      </section>

      <section className="bg-surface px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-4xl gap-8">
          {privacySections.map((section) => (
            <article key={section.title} className="border-l-2 border-gold pl-5">
              <h2 className="text-xl font-extrabold text-black-jewel">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm font-medium leading-7 text-black-jewel/72 sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          <div className="border-t border-gold/25 pt-8 text-sm font-medium leading-7 text-black-jewel/72 sm:text-base">
            <p>
              Esta pagina tem finalidade informativa e pode ser atualizada para
              refletir mudancas no servico, na legislacao ou nas praticas de
              seguranca.
            </p>
            <Link
              href="/terms"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-emerald px-6 text-sm font-extrabold uppercase tracking-normal text-white transition hover:bg-emerald/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald"
            >
              Ver termos de uso
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
