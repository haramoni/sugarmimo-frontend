import type { Metadata } from "next";
import Link from "next/link";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";

export const metadata: Metadata = {
  title: "Termos de Uso | SugarMimo",
  description: "Termos de Uso da plataforma SugarMimo.",
};

const termsSections = [
  {
    title: "Elegibilidade",
    paragraphs: [
      "O SugarMimo é destinado exclusivamente a pessoas adultas. Ao criar uma conta, você declara ter 18 anos ou mais e capacidade legal para aceitar estes termos.",
      "Podemos solicitar verificações adicionais para preservar a segurança da comunidade e remover contas que violem esta regra.",
    ],
  },
  {
    title: "Uso permitido",
    paragraphs: [
      "A plataforma deve ser usada para conexões consensuais, respeitosas e transparentes entre adultos.",
      "É proibido usar o serviço para exploração, comércio sexual, fraude, assédio, ameaças, divulgação não autorizada de dados ou qualquer atividade ilegal.",
    ],
  },
  {
    title: "Conta e informações do perfil",
    paragraphs: [
      "Você é responsável por manter informações verdadeiras, atuais e compatíveis com as regras da comunidade.",
      "Não compartilhe sua senha e avise a equipe caso suspeite de acesso indevido à sua conta.",
    ],
  },
  {
    title: "Conteúdo e conduta",
    paragraphs: [
      "Fotos, textos e interações devem respeitar direitos de terceiros, privacidade, consentimento e legislação aplicável.",
      "Podemos revisar, ocultar ou remover conteúdos e perfis quando houver suspeita de violação dos termos, risco a usuários ou exigência legal.",
    ],
  },
  {
    title: "Alterações e encerramento",
    paragraphs: [
      "Podemos atualizar estes termos para refletir mudanças na plataforma ou requisitos legais. O uso contínuo do serviço após a atualização indica concordância com a nova versão.",
      "Você pode deixar de usar a plataforma a qualquer momento, e a SugarMimo pode limitar ou encerrar contas que violem estes termos.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-extrabold uppercase tracking-normal text-gold">
            SugarMimo
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
            Termos de Uso
          </h1>
          <p className="mt-5 text-base font-medium leading-8 text-black-jewel/76 sm:text-lg">
            Estes termos definem as regras básicas para uso da plataforma
            SugarMimo, criada para conexões consensuais, seguras e transparentes
            entre adultos.
          </p>
          <p className="mt-4 text-sm font-semibold text-black-jewel/60">
            Última atualização: 6 de julho de 2026
          </p>
        </div>
      </section>

      <section className="bg-surface px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-4xl gap-8">
          {termsSections.map((section) => (
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
              Estes termos não substituem orientação jurídica específica. Antes
              da publicação definitiva, recomendamos revisar o conteúdo com um
              profissional qualificado.
            </p>
            <Link
              href="/privacy"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-emerald px-6 text-sm font-extrabold uppercase tracking-normal text-white transition hover:bg-emerald/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald"
            >
              Ver política de privacidade
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
