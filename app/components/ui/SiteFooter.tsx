import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const footerGroups = [
  {
    title: "SugarMimo",
    links: [
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Galeria de Elite", href: "/galeria-de-elite" },
      { label: "Blog", href: "/blog" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Sobre o site",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Segurança", href: "/seguranca" },
      { label: "Termos de uso", href: "/terms" },
      { label: "Privacidade", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/35 bg-[color-mix(in_srgb,var(--black)_94%,var(--emerald))] px-6 py-12 text-white sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr_0.9fr]">
        <div className="space-y-5">
          <Link href="/" aria-label="SugarMimo" className="inline-flex">
            <Image
              src="/sm-image.png"
              alt="SugarMimo"
              width={170}
              height={57}
              className="h-auto w-40 object-contain brightness-0 invert"
              style={{ height: "auto" }}
            />
          </Link>
          <p className="max-w-md text-sm font-medium leading-7 text-white/72">
            Uma comunidade para adultos que procuram conexões refinadas,
            transparentes e alinhadas com um estilo de vida mais exclusivo.
          </p>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md bg-gold px-6 text-sm font-extrabold uppercase tracking-normal text-white transition hover:bg-gold-soft hover:text-black-jewel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Cadastre-se
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-normal text-gold-soft">
                {group.title}
              </h2>
              <nav className="grid gap-3 text-sm font-semibold text-white/74">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit transition hover:text-gold-soft"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-normal text-gold-soft">
            Atendimento
          </h2>
          <div className="grid gap-3 text-sm font-semibold text-white/76">
            <a
              href="mailto:contato.sugarmimo@gmail.com"
              className="flex items-center gap-3 transition hover:text-gold-soft"
            >
              <Mail className="h-4 w-4 text-gold-soft" />
              contato.sugarmimo@gmail.com
            </a>
            <a
              href="tel:+55 11 99775-2731"
              className="flex items-center gap-3 transition hover:text-gold-soft"
            >
              <Phone className="h-4 w-4 text-gold-soft" />
              (11) 99775-2731
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/12 pt-5 text-xs font-semibold text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 SugarMimo. Todos os direitos reservados.</p>
        <p>Relacionamentos consensuais entre adultos.</p>
      </div>
    </footer>
  );
}
