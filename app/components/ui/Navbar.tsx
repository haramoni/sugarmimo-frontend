"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Mensagens", href: "/mensagens" },
  { label: "Buscar", href: "/buscar" },
  { label: "Interesses", href: "/interesses" },
  { label: "Perfil", href: "/perfil" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--background)_78%,transparent))] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <nav className="mx-auto grid max-w-7xl items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emerald)]"
        >
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--gold)_48%,transparent)] bg-[var(--surface)] shadow-[0_14px_34px_rgba(20,17,14,0.10)]">
            <span className="absolute inset-1 rounded-full border border-[color:color-mix(in_srgb,var(--silver)_55%,transparent)]" />
            <Image
              src="/sm-icon.png"
              alt="SugarMimo"
              width={38}
              height={38}
              priority
              className="relative h-8 w-8 object-contain"
            />
          </span>

          <span className="leading-none">
            <span className="block font-serif text-2xl font-semibold text-[var(--black)]">
              Sugar<span className="text-[var(--gold)]">Mimo</span>
            </span>
            <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.26em] text-[var(--secondary)] sm:block">
              Private Social Club
            </span>
          </span>
        </Link>

        <div className="order-3 flex gap-2 overflow-x-auto rounded-full border border-[color:color-mix(in_srgb,var(--silver)_38%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_82%,transparent)] p-1.5 text-sm font-semibold text-[var(--secondary)] shadow-[0_18px_50px_rgba(20,17,14,0.10)] ring-1 ring-white/70 backdrop-blur-2xl lg:order-none lg:justify-center">
          {menuItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative shrink-0 rounded-full px-4 py-2.5 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emerald)]",
                  active
                    ? "bg-[var(--black)] text-[var(--surface)] shadow-[0_10px_26px_rgba(20,17,14,0.18)]"
                    : "hover:bg-white/80 hover:text-[var(--black)]",
                ].join(" ")}
              >
                <span className="relative z-10">{item.label}</span>
                {active ? (
                  <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-[linear-gradient(90deg,var(--silver),var(--gold),var(--emerald))]" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="hidden justify-self-end sm:flex">
          <Link
            href="/perfil"
            className="group inline-flex items-center gap-3 rounded-full border border-[color:color-mix(in_srgb,var(--gold)_44%,transparent)] bg-[var(--black)] py-1.5 pl-4 pr-1.5 text-sm font-bold text-[var(--surface)] shadow-[0_16px_38px_rgba(20,17,14,0.16)] transition duration-300 hover:bg-[color:color-mix(in_srgb,var(--black)_88%,var(--emerald))]"
          >
            Area exclusiva
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)] text-[var(--black)] transition duration-300 group-hover:bg-[var(--surface)]">
              →
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
