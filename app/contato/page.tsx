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
    <main className="premium-page-shell">
      <NavBarMenu />

      <section className="border-b border-luxury-gold/22 bg-luxury-black/32 px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-luxury-champagne">
            Estamos aqui por você
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-luxury-ivory sm:text-5xl">
            Como podemos ajudar?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-luxury-muted sm:text-lg">
            Escolha o canal que preferir. Nossa equipe está pronta para ouvir,
            orientar e tornar sua experiência na SugarMimo mais tranquila.
          </p>
        </div>
      </section>

      <section className="bg-transparent px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {contactChannels.map(
              ({ title, description, value, action, href, icon: Icon }) => (
                <article
                  key={title}
                  className="premium-surface-card flex min-h-96 flex-col items-center rounded-2xl p-8 text-center"
                >
                  <div className="premium-icon-medallion h-14 w-14 rounded-full">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-luxury-ivory">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-luxury-muted">
                    {description}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      target={title === "WhatsApp" ? "_blank" : undefined}
                      rel={title === "WhatsApp" ? "noreferrer" : undefined}
                      className="mt-6 break-words text-base font-extrabold text-luxury-champagne underline decoration-luxury-gold/55 decoration-1 underline-offset-4 transition hover:text-luxury-ivory"
                      aria-label={`${action}: ${value}`}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-6 break-words text-base font-extrabold text-luxury-champagne">
                      {value}
                    </p>
                  )}

                  {href && action ? (
                    <a
                      href={href}
                      target={title === "WhatsApp" ? "_blank" : undefined}
                      rel={title === "WhatsApp" ? "noreferrer" : undefined}
                      className="premium-secondary-action mt-12 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition"
                    >
                      {action}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </article>
              ),
            )}
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-xl border border-luxury-gold/24 bg-luxury-gold/7 p-5 text-center sm:flex-row sm:justify-center">
            <ShieldCheck
              className="mt-0.5 h-6 w-6 shrink-0 text-luxury-champagne sm:mt-0"
              aria-hidden="true"
            />
            <p className="text-sm font-medium leading-6 text-luxury-muted">
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
