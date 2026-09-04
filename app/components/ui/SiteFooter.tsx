import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const footerGroups = [
  {
    title: "O Clube",
    links: [
      { label: "Manifesto", href: "/#clube" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Perfis", href: "/#perfis" },
      { label: "Experiências", href: "/#experiencias" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Perguntas frequentes", href: "/#faq" },
      { label: "Segurança e privacidade", href: "/#privacidade" },
      { label: "Atendimento", href: "/atendimento" },
      { label: "Fale conosco", href: "/contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/terms" },
      { label: "Política de Privacidade", href: "/privacy" },
      { label: "Política de Cookies", href: "/privacy#pagina-8" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e1bd8a]/15 bg-[#080808] px-6 text-[#f4ecdf] sm:px-10">
      <div className="mx-auto max-w-7xl py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="SugarMimo" className="inline-flex">
              <Image
                src="/brand/logo-dark-bg.webp"
                alt="SugarMimo"
                width={180}
                height={42}
                className="h-auto w-40 object-contain"
              />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-[#969189]">
              Um clube privado de conexões entre adultos, construído sobre
              segurança, privacidade e liberdade de escolha.
            </p>
            <p className="mt-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.26em] text-[#e1bd8a]/80">
              Maior de 18 anos
              <Image
                src="/brand/heart.webp"
                alt=""
                aria-hidden
                width={12}
                height={12}
                className="h-3 w-3 object-contain"
              />
              Conteúdo adulto
            </p>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#d0d0d0]">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#969189] transition hover:text-[#e1bd8a]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <section
          aria-labelledby="institutional-identification"
          className="mt-14 grid gap-5 border-t border-[#e1bd8a]/12 pt-8 text-xs leading-6 text-[#827f79] lg:grid-cols-[1fr_auto] lg:items-start"
        >
          <div>
            <h2
              id="institutional-identification"
              className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#c7c2b9]"
            >
              Identificação institucional
            </h2>
            <p>
              SPARKBRIDGE VENTURES – CNPJ nº 68.573.395/0001-55. Privacidade:{" "}
              <a
                href="mailto:privacidade@sugarmimo.com"
                className="transition hover:text-[#e1bd8a]"
              >
                privacidade@sugarmimo.com
              </a>
              . Denúncias:{" "}
              <a
                href="mailto:denuncia@sugarmimo.com"
                className="transition hover:text-[#e1bd8a]"
              >
                denuncia@sugarmimo.com
              </a>
              .
            </p>
          </div>

          <div className="grid gap-2 text-[#969189]">
            <a
              href="mailto:contato@sugarmimo.com"
              className="flex items-center gap-3 transition hover:text-[#e1bd8a]"
            >
              <Mail className="h-4 w-4 text-[#e1bd8a]" />
              contato@sugarmimo.com
            </a>
            <a
              href="tel:+5511997752731"
              className="flex items-center gap-3 transition hover:text-[#e1bd8a]"
            >
              <Phone className="h-4 w-4 text-[#e1bd8a]" />
              (11) 99775-2731
            </a>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#e1bd8a]/12 pt-7 text-xs text-[#6f6c67] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SugarMimo. Todos os direitos reservados.</p>
          <p className="uppercase tracking-[0.18em]">
            Discrição · Respeito · Consentimento
          </p>
        </div>
      </div>
    </footer>
  );
}
