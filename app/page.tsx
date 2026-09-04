import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  EyeOff,
  Flag,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
} from "lucide-react";
import NavBarMenu from "./components/ui/NavBarMenu";
import { SiteFooter } from "./components/ui/SiteFooter";
import { LandingMotion } from "./components/LandingMotion";
import WhatsappBubble from "@/components/whatsapp-bubble";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
  description:
    "Conheça o SugarMimo, clube de relacionamento sugar para adultos com perfis moderados, privacidade, consentimento e intenções claras.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
    description:
      "Conexões e relacionamentos sugar entre adultos com elegância, segurança e liberdade de escolha.",
    url: "/",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/brand/hero-trio-hq-4k.webp",
        width: 3548,
        height: 1774,
        type: "image/webp",
        alt: "SugarMimo — Elegância, segurança e liberdade de escolha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
    description:
      "Conexões e relacionamentos sugar entre adultos com elegância, segurança e liberdade de escolha.",
    images: ["/brand/hero-trio-hq-4k.webp"],
  },
};

const principles = [
  {
    title: "Segurança",
    text: "Perfis moderados, ferramentas de denúncia e uma equipe atenta para manter o clube mais confiável.",
  },
  {
    title: "Privacidade",
    text: "Você controla o que compartilha, com quem e quando. Fotos privadas e contatos continuam sob sua decisão.",
  },
  {
    title: "Escolha",
    text: "Cada membro declara as próprias expectativas, ritmo e limites para começar conversas mais honestas.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie o seu perfil",
    text: "Escolha sua categoria, conte quem você é e avance pelo cadastro seguro da SugarMimo.",
  },
  {
    number: "02",
    title: "Passe pela curadoria",
    text: "Fotos e informações passam pela revisão necessária para proteger a qualidade da comunidade.",
  },
  {
    number: "03",
    title: "Descubra com discrição",
    text: "Use busca, pins e perfis detalhados para encontrar pessoas alinhadas às suas intenções.",
  },
  {
    number: "04",
    title: "Converse com clareza",
    text: "Chat, notificações e controles de privacidade ajudam a construir a conexão no seu ritmo.",
  },
];

const safeguards = [
  {
    icon: BadgeCheck,
    title: "Curadoria de perfis",
    text: "Cadastros sensíveis e fotos passam por moderação antes de ganhar visibilidade no clube.",
  },
  {
    icon: EyeOff,
    title: "Fotos privadas",
    text: "Você escolhe o momento de liberar imagens privadas e pode revogar o acesso quando quiser.",
  },
  {
    icon: LockKeyhole,
    title: "Dados protegidos",
    text: "Consentimentos, preferências e solicitações de privacidade são tratados conforme a LGPD.",
  },
  {
    icon: Flag,
    title: "Denúncia e bloqueio",
    text: "Recursos de denúncia, bloqueio e moderação estão disponíveis dentro das conversas e perfis.",
  },
];

const gallery = [
  {
    src: "/brand/gallery-dinner.jpg",
    alt: "Jantar elegante à luz de velas",
    label: "Jantares que não têm pressa",
  },
  {
    src: "/brand/gallery-rooftop.jpg",
    alt: "Taças de champagne em um terraço com vista da cidade",
    label: "Brindes acima da cidade",
  },
  {
    src: "/brand/gallery-suite.jpg",
    alt: "Suíte sofisticada preparada para uma viagem especial",
    label: "Escapadas cinco estrelas",
  },
  {
    src: "/brand/sugar-card.jpg",
    alt: "Mulher elegante sob iluminação dourada",
    label: "Presença que ilumina o salão",
  },
];

const faqs = [
  {
    question: "A SugarMimo é um site de acompanhantes?",
    answer:
      "Não. A SugarMimo é uma plataforma de conexões entre adultos baseada em consentimento, transparência e respeito. Não intermediamos nem toleramos exploração ou coerção.",
  },
  {
    question: "Como funciona o cadastro?",
    answer:
      "Você escolhe a categoria do perfil, informa seus dados básicos, descreve suas intenções, adiciona contatos e envia fotos. As etapas e verificações mudam conforme o tipo de perfil.",
  },
  {
    question: "Como minha privacidade é protegida?",
    answer:
      "Você controla fotos privadas e informações de contato. A plataforma também oferece bloqueio, denúncia, exclusão da conta e solicitações relacionadas aos seus dados.",
  },
  {
    question: "Todos os perfis são aprovados automaticamente?",
    answer:
      "Não. Alguns cadastros e fotos passam por análise da equipe. O status de aprovação e eventuais pedidos de ajuste aparecem no próprio fluxo da conta.",
  },
  {
    question: "Quais recursos encontro depois de entrar?",
    answer:
      "Conforme sua categoria, você pode buscar perfis, salvar pins, conversar no chat, acompanhar notificações, editar o perfil e gerenciar privacidade e segurança.",
  },
  {
    question: "Posso excluir minha conta?",
    answer:
      "Sim. Você pode gerenciar a conta e suas preferências nas configurações, de acordo com os Termos e a Política de Privacidade.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#e1bd8a]">
      {children}
    </p>
  );
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        alternateName: site.alternateName,
        legalName: site.legalName,
        taxID: site.taxId,
        url: site.url,
        logo: absoluteUrl("/brand/monogram-dark.webp"),
        description: site.description,
        email: site.email,
        telephone: site.telephone,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: site.email,
            telephone: site.telephone,
            availableLanguage: ["Portuguese"],
            areaServed: "BR",
          },
          {
            "@type": "ContactPoint",
            contactType: "privacy",
            email: site.privacyEmail,
            availableLanguage: ["Portuguese"],
            areaServed: "BR",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        alternateName: site.alternateName,
        description: site.description,
        inLanguage: site.language,
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}/#webpage`,
        url: site.url,
        name: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
        description: site.description,
        inLanguage: site.language,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq-schema`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-[#f4ecdf]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <LandingMotion />
      <NavBarMenu />

      <section
        id="topo"
        className="relative isolate min-h-svh overflow-hidden border-b border-[#e1bd8a]/15"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/brand/hero-trio-image.webp"
            alt="Editorial SugarMimo com atmosfera elegante em tons de champagne"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="sm-hero-media scale-105 object-cover object-top"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#080808_0%,rgba(8,8,8,0.72)_28%,rgba(8,8,8,0.25)_68%,rgba(8,8,8,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,8,8,0.58)_100%)]" />
        </div>

        <div className="mx-auto flex min-h-svh max-w-7xl flex-col items-center justify-end px-6 pb-24 pt-32 text-center sm:pb-28 lg:px-10">
          <div className="sm-hero-copy max-w-4xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.45em] text-[#e1bd8a] sm:text-xs">
              Clube privado de relacionamento sugar
            </p>
            <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-[#f8f1e7] drop-shadow-[0_4px_28px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl">
              Onde a elegância
              <span className="block bg-[linear-gradient(135deg,#f3d7aa_0%,#e1bd8a_48%,#9c7443_115%)] bg-clip-text italic text-transparent">
                encontra a liberdade
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#d0d0d0]/85 sm:text-lg sm:leading-8">
              Relacionamentos sugar entre adultos, construídos com
              transparência, respeito e intenções claras — desde o primeiro olá.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="sm-luxury-button">
                Tornar-se membro
              </Link>
              <Link href="#clube" className="sm-outline-button">
                Conhecer o clube
              </Link>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="sm-scroll-indicator absolute bottom-7 left-1/2 h-12 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(225,189,138,0.75),transparent)]"
        />
      </section>

      <section
        id="clube"
        className="sm-grain relative border-b border-[#e1bd8a]/12 bg-[#080808] py-24 sm:py-32 lg:py-40"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
          <div>
            <Eyebrow>Manifesto</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium leading-[1.08] text-[#f4ecdf] sm:text-5xl">
              Relacionamentos adultos,
              <span className="block bg-[linear-gradient(135deg,#f3d7aa,#e1bd8a,#9c7443)] bg-clip-text italic text-transparent">
                sem roteiros impostos
              </span>
            </h2>
            <p className="mt-7 text-base leading-8 text-[#a9a49b] sm:text-lg">
              A SugarMimo nasceu para adultos que querem ser honestos sobre o
              que procuram, sem abrir mão de segurança e discrição. Aqui,
              elegância não é apenas estética. É conduta.
            </p>

            <div className="mt-10 space-y-7">
              {principles.map((principle) => (
                <article key={principle.title} className="flex gap-5">
                  <Image
                    src="/brand/heart.webp"
                    alt=""
                    aria-hidden
                    width={16}
                    height={16}
                    className="mt-1 h-4 w-4 shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="font-serif text-xl text-[#e1bd8a]">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#99958d]">
                      {principle.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <figure className="relative overflow-hidden rounded-[1.75rem] border border-[#e1bd8a]/18">
            <Image
              src="/brand/vanity.webp"
              alt="Penteadeira com joias e perfume sob luz dourada"
              width={1024}
              height={1280}
              quality={95}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.72),transparent_48%)]" />
            <figcaption className="absolute inset-x-7 bottom-7 font-serif text-lg italic text-[#e6ded1]/90">
              “A sofisticação está nos detalhes que ninguém precisa apressar.”
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-20 border-b border-[#e1bd8a]/12 bg-[#11100e] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">
              Quatro passos,
              <span className="italic text-[#e1bd8a]"> nenhuma pressa</span>
            </h2>
          </div>

          <div className="mt-14 grid overflow-hidden rounded-[1.75rem] border border-[#e1bd8a]/15 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group min-h-72 border-b border-[#e1bd8a]/12 bg-[#11100e] p-8 transition duration-500 hover:bg-[#1b1916] sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="font-serif text-5xl font-light text-[#705127] transition duration-500 group-hover:text-[#e1bd8a]">
                  {step.number}
                </span>
                <h3 className="mt-7 font-serif text-xl text-[#f4ecdf]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#969189]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e1bd8a]/12 bg-[#080808] py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Duas jornadas</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium sm:text-5xl">
              Relacionamentos Sugar{" "}
              <span className="italic text-[#e1bd8a]">&</span> Daddy
            </h2>
            <p className="mt-6 text-base leading-8 text-[#99958d]">
              Perfis diferentes, o mesmo princípio: intenções claras,
              consentimento e respeito aos limites de cada pessoa.
            </p>
          </div>

          <div className="relative mt-16 grid gap-7 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-[#e1bd8a]/16 bg-[#11100e] p-8 sm:p-10">
              <Eyebrow>Perfil Sugar</Eyebrow>
              <h3 className="mt-5 font-serif text-2xl">
                Quem escolhe o próprio caminho
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#99958d]">
                Para quem valoriza o próprio tempo, quer declarar expectativas e
                manter controle sobre fotos, contatos e ritmo da conexão.
              </p>
              <ul className="mt-8 space-y-3 border-t border-[#e1bd8a]/12 pt-7 text-sm text-[#c7c2b9]">
                <li>— Cadastro completo e sujeito à curadoria</li>
                <li>— Busca, pins, chat e notificações</li>
                <li>— Controle sobre fotos e contatos privados</li>
              </ul>
            </article>

            <article className="rounded-[1.75rem] border border-[#e1bd8a]/16 bg-[#11100e] p-8 sm:p-10">
              <Eyebrow>Perfil Daddy</Eyebrow>
              <h3 className="mt-5 font-serif text-2xl">
                Quem valoriza a boa companhia
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#99958d]">
                Para adultos estabelecidos que procuram conversas interessantes,
                presença elegante e conexões construídas com propósito.
              </p>
              <ul className="mt-8 space-y-3 border-t border-[#e1bd8a]/12 pt-7 text-sm text-[#c7c2b9]">
                <li>— Intenções declaradas desde o cadastro</li>
                <li>— Recursos de destaque e experiência Première</li>
                <li>— Privacidade e moderação integradas</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section
        id="perfis"
        className="scroll-mt-20 border-b border-[#e1bd8a]/12 bg-[#11100e] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Escolha a sua jornada</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">
              Duas portas de entrada,
              <span className="block italic text-[#e1bd8a]">
                um mesmo clube
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-2">
            <article className="group relative min-h-[34rem] overflow-hidden rounded-[1.75rem] border border-[#e1bd8a]/18">
              <Image
                src="/brand/sugar-card.jpg"
                alt="Mulher elegante em vestido de seda champagne"
                fill
                quality={95}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition duration-[1400ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#080808_2%,rgba(8,8,8,0.75)_34%,transparent_72%)]" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <Eyebrow>Sou Sugar</Eyebrow>
                <h3 className="mt-4 font-serif text-3xl">
                  O meu tempo vale ouro
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#d0d0d0]/85">
                  Conte quem você é, defina seus limites e mantenha o controle
                  sobre a forma como deseja ser vista.
                </p>
                <Link href="/register" className="sm-luxury-button mt-7">
                  Criar perfil Sugar
                </Link>
              </div>
            </article>

            <article className="group relative min-h-[34rem] overflow-hidden rounded-[1.75rem] border border-[#e1bd8a]/18">
              <Image
                src="/brand/daddy-card.jpg"
                alt="Homem de terno em clube privado com iluminação âmbar"
                fill
                quality={95}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition duration-[1400ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#080808_2%,rgba(8,8,8,0.75)_34%,transparent_72%)]" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <Eyebrow>Sou Daddy</Eyebrow>
                <h3 className="mt-4 font-serif text-3xl">
                  A boa companhia é um privilégio
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#d0d0d0]/85">
                  Entre em uma comunidade que valoriza discrição, clareza e
                  conexões mais sofisticadas.
                </p>
                <Link href="/register" className="sm-outline-button mt-7">
                  Solicitar adesão
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-b border-[#e1bd8a]/12 py-28 sm:py-36">
        <Image
          src="/brand/gallery-dinner.jpg"
          alt=""
          aria-hidden
          fill
          quality={95}
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#080808]/82" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Image
            src="/brand/heart.webp"
            alt=""
            aria-hidden
            width={24}
            height={24}
            className="mx-auto h-6 w-6 object-contain"
          />
          <Eyebrow>
            <span className="mt-6 block">Área reservada</span>
          </Eyebrow>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl">
            Uma experiência feita para membros
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#c7c2b9]">
            Depois da aprovação, cada categoria encontra recursos próprios de
            busca, perfil, chat, privacidade e destaque — sem perder o cuidado
            que dá identidade ao clube.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="sm-luxury-button">
              Criar meu perfil
            </Link>
            <Link href="/login" className="sm-outline-button">
              Já sou membro
            </Link>
          </div>
        </div>
      </section>

      <section
        id="privacidade"
        className="sm-grain border-b border-[#e1bd8a]/12 bg-[#11100e] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Segurança & privacidade</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">
              O luxo verdadeiro é
              <span className="italic text-[#e1bd8a]"> estar seguro</span>
            </h2>
            <p className="mt-6 text-base leading-8 text-[#99958d]">
              Recursos reais do produto ajudam cada membro a controlar a própria
              experiência dentro do clube.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safeguards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#e1bd8a]/14 bg-[#080808] p-7 transition duration-300 hover:border-[#e1bd8a]/40"
                >
                  <Icon className="h-5 w-5 text-[#e1bd8a]" aria-hidden />
                  <h3 className="mt-5 font-serif text-lg">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#969189]">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex gap-4 rounded-2xl border border-[#e1bd8a]/14 bg-[#080808] p-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#e1bd8a]" />
            <p className="text-xs leading-6 text-[#99958d]">
              <strong className="font-semibold text-[#d0d0d0]">
                Compromisso de conduta:
              </strong>{" "}
              a SugarMimo é uma plataforma para adultos livres e consentidos.
              Coerção, exploração e desrespeito a limites não fazem parte do
              clube.
            </p>
          </div>
        </div>
      </section>

      <section
        id="experiencias"
        className="scroll-mt-20 border-b border-[#e1bd8a]/12 bg-[#080808] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Eyebrow>Experiências</Eyebrow>
              <h2 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">
                O estilo de vida
                <span className="italic text-[#e1bd8a]">
                  {" "}
                  que inspira o clube
                </span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#99958d]">
              Atmosferas que traduzem o universo SugarMimo: luz baixa, champagne
              e a calma de quem valoriza uma boa companhia.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {gallery.map((item) => (
              <figure
                key={item.src}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#e1bd8a]/16"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1280}
                  height={800}
                  quality={95}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="aspect-[16/10] w-full object-cover transition duration-[1400ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.78),transparent_58%)]" />
                <figcaption className="absolute inset-x-6 bottom-5 font-serif text-lg italic text-[#eee6da]">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-20 border-b border-[#e1bd8a]/12 bg-[#11100e] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <Eyebrow>Perguntas frequentes</Eyebrow>
            <h2 className="mt-6 font-serif text-4xl font-medium sm:text-5xl">
              Transparência,{" "}
              <span className="italic text-[#e1bd8a]">sempre</span>
            </h2>
          </div>

          <div className="mt-14 overflow-hidden rounded-[1.5rem] border border-[#e1bd8a]/14 bg-[#080808]">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group border-b border-[#e1bd8a]/12 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 font-serif text-lg text-[#f4ecdf] marker:hidden sm:p-8 sm:text-xl">
                  {faq.question}
                  <span className="text-2xl font-light text-[#e1bd8a] transition duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-7 text-sm leading-7 text-[#99958d] sm:px-8">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-grain relative overflow-hidden bg-[#080808] py-28 sm:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(112,81,39,0.24),transparent_58%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <MessageCircleMore className="mx-auto h-6 w-6 text-[#e1bd8a]" />
          <Eyebrow>
            <span className="mt-6 block">O convite está feito</span>
          </Eyebrow>
          <h2 className="mt-6 font-serif text-5xl font-medium leading-[1.05] sm:text-6xl">
            A porta do clube
            <span className="block italic text-[#e1bd8a]">está aberta</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-[#99958d]">
            Comece pelo seu cadastro e preserve, em cada etapa, o direito de
            escolher o que faz sentido para você.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="sm-luxury-button">
              Criar meu perfil
            </Link>
            <Link href="/login" className="sm-outline-button">
              Entrar no clube
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsappBubble />
    </main>
  );
}
