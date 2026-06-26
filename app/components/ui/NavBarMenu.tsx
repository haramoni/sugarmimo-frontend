"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Galeria de Elite", href: "/galeria-de-elite" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavBarMenu() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/35 bg-white/50 shadow-[0_2px_10px_rgba(20,17,14,0.14)]">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 sm:px-10 lg:px-16">
        <Link
          href="/"
          aria-label="SugarMimo"
          className="flex shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={150}
            height={84}
            priority
            className="h-auto w-36 object-contain sm:w-40"
          />
        </Link>

        <div className="hidden items-center gap-9 text-sm font-semibold text-black-jewel md:flex">
          {menuItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative whitespace-nowrap rounded-sm py-2 transition-colors duration-200 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {item.label}
                <span
                  className={[
                    "absolute inset-x-0 -bottom-1 mx-auto h-0.5 rounded-full bg-gold transition-all duration-200",
                    active ? "w-full" : "w-0 group-hover:w-full",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </div>

        <Link
          href="/login"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-gold/55 bg-gold px-5 text-sm font-bold text-black-jewel shadow-[0_2px_8px_rgba(20,17,14,0.08)] transition duration-200 hover:border-gold hover:bg-gold/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          Entrar
        </Link>
      </nav>
    </header>
  );
}
