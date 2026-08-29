import type { Metadata } from "next";
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { contact, whatsappUrl } from "@/lib/contact";
import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contato | SugarMimo",
  description:
    "Fale com a equipe SugarMimo por e-mail, WhatsApp ou suporte técnico.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: "Contato | SugarMimo",
    description:
      "Fale com a equipe SugarMimo por e-mail, WhatsApp ou suporte técnico.",
    url: "/contato",
  },
};

const contactChannels = [
  {
    title: "E-mail",
    description:
      "Para dúvidas, sugestões e assuntos que precisam de mais detalhes.",
    value: contact.email,
    action: null,
    href: null,
    icon: Mail,
  },
  {
    title: "WhatsApp",
    description:
      "Para conversar com a nossa equipe e receber atendimento geral.",
    value: contact.whatsappDisplay,
    action: "Conversar no WhatsApp",
    href: whatsappUrl,
    icon: MessageCircle,
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initialCategory = [
    "ATENDIMENTO",
    "RECLAMACAO",
    "CANCELAMENTO",
    "PRIVACIDADE",
    "DENUNCIA",
  ].includes(category ?? "")
    ? category
    : "ATENDIMENTO";
  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-normal text-gold">
            Estamos aqui por você
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
            Como podemos ajudar?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-black-jewel/72 sm:text-lg">
            Escolha o canal que preferir. Nossa equipe está pronta para ouvir,
            orientar e tornar sua experiência na SugarMimo mais tranquila.
          </p>
        </div>
      </section>

      <section className="bg-surface px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {contactChannels.map(
              ({ title, description, value, action, href, icon: Icon }) => (
                <article
                  key={title}
                  className="flex min-h-96 flex-col items-center rounded-2xl border border-gold/25 bg-white p-8 text-center shadow-[0_18px_48px_rgba(20,17,14,0.07)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-white shadow-[0_8px_20px_rgba(0,108,88,0.22)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-black-jewel">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-black-jewel/66">
                    {description}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      target={title === "WhatsApp" ? "_blank" : undefined}
                      rel={title === "WhatsApp" ? "noreferrer" : undefined}
                      className="mt-6 break-words text-base font-extrabold text-emerald underline decoration-gold/55 decoration-1 underline-offset-4 transition hover:text-gold focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                      aria-label={`${action}: ${value}`}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-6 break-words text-base font-extrabold text-emerald">
                      {value}
                    </p>
                  )}

                  {href && action ? (
                    <a
                      href={href}
                      target={title === "WhatsApp" ? "_blank" : undefined}
                      rel={title === "WhatsApp" ? "noreferrer" : undefined}
                      className="mt-12 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald/40 bg-transparent px-6 py-2.5 text-sm font-bold text-emerald transition hover:border-emerald hover:bg-emerald hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald"
                    >
                      {action}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </article>
              ),
            )}
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-xl border border-gold/25 bg-background-vanilla/25 p-5 text-center sm:flex-row sm:justify-center">
            <ShieldCheck
              className="mt-0.5 h-6 w-6 shrink-0 text-emerald sm:mt-0"
              aria-hidden="true"
            />
            <p className="text-sm font-medium leading-6 text-black-jewel/68">
              Para sua segurança, nunca envie senhas ou códigos de acesso. Ao
              falar com o suporte, conte apenas o necessário para identificarmos
              e resolvermos o problema.
            </p>
          </div>

          <ContactForm initialCategory={initialCategory} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
