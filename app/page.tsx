import Image from "next/image";
import Link from "next/link";
import { Gem, HeartHandshake, ShieldCheck, UserCheck } from "lucide-react";
import NavBarMenu from "./components/ui/NavBarMenu";
import { SiteFooter } from "./components/ui/SiteFooter";
import WhatsappBubble from "@/components/whatsapp-bubble";

const modelHighlights = [
  {
    title: "Perfis com Intenção",
    description:
      "Cada cadastro orienta o usuário a declarar quem é, o que busca e qual tipo de conexão faz sentido para sua fase de vida.",
    icon: UserCheck,
  },
  {
    title: "Curadoria e Cuidado",
    description:
      "O fluxo privilegia informações reais, fotos de perfil e revisão de contas sensíveis para manter um ambiente mais confiável.",
    icon: ShieldCheck,
  },
  {
    title: "Acordos Claros",
    description:
      "O SugarMimo aproxima adultos que valorizam transparência, respeito, generosidade e expectativas conversadas desde o início.",
    icon: HeartHandshake,
  },
  {
    title: "Experiência Exclusiva",
    description:
      "A proposta é entregar uma comunidade elegante, objetiva e menos ruidosa para quem procura relacionamento refinado.",
    icon: Gem,
  },
];

export default function Home() {
  return (
    <main className="page-marble-background min-h-screen overflow-hidden bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="relative isolate min-h-screen border-b border-gold/45">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-tabacaria-premium-sugarmimo-marrom.png"
            alt="Casal elegante em um encontro sofisticado"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_center] sm:object-[14%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,14,7,0.94)_0%,rgba(35,19,10,0.86)_34%,rgba(43,24,13,0.48)_54%,rgba(28,15,8,0.08)_76%)] sm:bg-[linear-gradient(90deg,rgba(27,14,7,0.92)_0%,rgba(35,19,10,0.82)_36%,rgba(43,24,13,0.34)_58%,transparent_78%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,12,7,0.18),transparent_30%,rgba(22,12,7,0.20))]" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-16 pt-28 sm:px-10 lg:px-16">
          <div className="max-w-[42rem]">
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.24em] text-champagne sm:text-sm">
              Relacionamentos requintados
            </p>
            <h1 className="font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream drop-shadow-[0_3px_18px_rgba(0,0,0,0.38)] sm:text-6xl lg:text-[4.5rem]">
              <span className="block text-champagne">Descubra Conexões Reais</span>
              <span className="mt-2 block">Romance de Elite</span>
            </h1>
            <div className="mt-7 max-w-xl rounded-xl border border-champagne/25 bg-espresso/62 px-5 py-4 shadow-[0_16px_38px_rgba(18,9,4,0.24)] backdrop-blur-md">
              <p className="max-w-lg text-base font-medium leading-7 text-cream/90 sm:text-lg sm:leading-8">
                Descubra o SugarMimo, um refúgio para relacionamentos refinados,
                seguros e mutuamente gratificantes entre pessoas generosas e
                sofisticadas.
              </p>
            </div>

            <Link
              href="/register"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-md border border-champagne/70 bg-gold px-8 text-sm font-extrabold uppercase tracking-[0.04em] text-espresso shadow-[0_12px_30px_rgba(15,8,4,0.34)] transition duration-200 hover:-translate-y-0.5 hover:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
            >
              Criar perfil grátis
            </Link>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-24 border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-6 py-20 backdrop-blur-sm sm:px-10 lg:px-16"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-sm font-extrabold uppercase tracking-normal text-gold">
                Como funciona
              </p>
              <h2 className="font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
                Relacionamentos com clareza, elegância e reciprocidade.
              </h2>
              <p className="max-w-xl text-base font-medium leading-8 text-black-jewel/76 sm:text-lg">
                O SugarMimo foi pensado para adultos que querem conhecer pessoas
                com objetivos alinhados. A plataforma não vende promessas
                vazias: ela organiza o primeiro passo para conversas mais
                honestas, seguras e compatíveis.
              </p>
            </div>

            <div className="grid gap-3 border-l-2 border-gold pl-5 text-sm font-semibold leading-7 text-black-jewel/78">
              <p>
                Sugar Babies encontram pessoas maduras, generosas e abertas a
                construir uma dinâmica transparente.
              </p>
              <p>
                Sugar Daddies e Sugar Mommies encontram perfis que valorizam
                presença, cuidado, estilo de vida e combinados respeitosos.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md bg-emerald px-7 text-sm font-extrabold uppercase tracking-normal text-white shadow-[0_12px_28px_rgba(0,108,88,0.22)] transition duration-200 hover:bg-emerald/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald"
            >
              Começar cadastro
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {modelHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={[
                    "min-h-56 rounded-md border bg-white/74 p-5 shadow-[0_18px_44px_rgba(20,17,14,0.10)]",
                    index === 1 || index === 2
                      ? "border-emerald/25"
                      : "border-gold/30",
                  ].join(" ")}
                >
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-md bg-[color-mix(in_srgb,var(--gold-soft)_42%,white)] text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-black-jewel">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-black-jewel/72">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsappBubble />
    </main>
  );
}
