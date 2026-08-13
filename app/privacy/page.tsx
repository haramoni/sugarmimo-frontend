import type { Metadata } from "next";
import Link from "next/link";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";

export const metadata: Metadata = {
  title: "Política de Privacidade | SugarMimo",
  description: "Política de Privacidade da plataforma SugarMimo.",
};

const privacySections = [
  {
    title: "Dados que coletamos",
    paragraphs: [
      "Coletamos as informações fornecidas durante o cadastro, como nome de usuário, e-mail, data de nascimento, localização, tipo de perfil, preferências, fotos e respostas do formulário.",
      "Também podemos registrar dados técnicos, como endereço IP, identificadores de sessão, cookies essenciais, data de acesso e informações do dispositivo para segurança e funcionamento da plataforma.",
    ],
  },
  {
    title: "Como usamos os dados",
    paragraphs: [
      "Usamos os dados para criar e proteger sua conta, exibir perfis, apoiar a curadoria da comunidade, prevenir abusos, cumprir obrigações legais e melhorar a experiência do usuário.",
      "Informações sensíveis de contato, como e-mail, não são exibidas publicamente no perfil.",
    ],
  },
  {
    title: "Compartilhamento",
    paragraphs: [
      "Não vendemos dados pessoais. Podemos compartilhar informações apenas com fornecedores necessários para a operação do serviço, autoridades competentes quando exigido por lei ou em situações necessárias para proteger usuários e a plataforma.",
    ],
  },
  {
    title: "Segurança e retenção",
    paragraphs: [
      "Adotamos medidas técnicas e administrativas para reduzir riscos de acesso indevido, perda, alteração ou divulgação não autorizada.",
      "Mantemos os dados pelo tempo necessário para prestar o serviço, atender a obrigações legais, resolver disputas e proteger a comunidade.",
    ],
  },
  {
    title: "Seus direitos",
    paragraphs: [
      "Você pode solicitar acesso, correção, exclusão, portabilidade ou revisão do tratamento dos seus dados, conforme a legislação aplicável.",
      "Para exercer seus direitos, entre em contato pelo canal indicado no rodapé do site.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-extrabold uppercase tracking-normal text-gold">
            SugarMimo
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
            Política de Privacidade
          </h1>
          <p className="mt-5 text-base font-medium leading-8 text-black-jewel/76 sm:text-lg">
            Esta política explica como tratamos dados pessoais na plataforma
            SugarMimo. A plataforma é exclusiva para adultos e deve ser usada
            apenas por pessoas com 18 anos ou mais.
          </p>
          <p className="mt-4 text-sm font-semibold text-black-jewel/60">
            Última atualização: 6 de julho de 2026
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
              Esta página tem finalidade informativa e pode ser atualizada para
              refletir mudanças no serviço, na legislação ou nas práticas de
              segurança.
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
