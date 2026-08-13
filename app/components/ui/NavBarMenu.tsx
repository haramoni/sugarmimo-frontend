"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useAuth } from "../AuthProvider";
import { AccountMenu } from "./AccountMenu";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Como Funciona", href: "/#como-funciona" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

function isActivePath(pathname: string, hash: string, href: string) {
  if (href.includes("#")) {
    const [hrefPath, hrefHash] = href.split("#");
    return pathname === hrefPath && hash === `#${hrefHash}`;
  }

  return href === "/" ? pathname === "/" && !hash : pathname.startsWith(href);
}

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("sugarmimo-hash", callback);

  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("sugarmimo-hash", callback);
  };
}

function getHashSnapshot() {
  return window.location.hash;
}

export default function NavBarMenu() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, () => "");
  const { user } = useAuth();
  const username = user?.username ?? "";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/35 bg-white/50 shadow-[0_2px_10px_rgba(20,17,14,0.14)]">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-10 lg:px-16">
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
            className="h-auto w-28 object-contain sm:w-40"
            style={{ height: "auto" }}
          />
        </Link>

        <div className="hidden items-center gap-9 text-sm font-semibold text-black-jewel md:flex">
          {menuItems.map((item) => {
            const active = isActivePath(pathname, hash, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  window.dispatchEvent(new Event("sugarmimo-hash"))
                }
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

        {username ? (
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/blog"
              className="text-sm font-bold text-black-jewel transition hover:text-gold md:hidden"
            >
              Blog
            </Link>
            <Link
              href="/buscar"
              className="hidden max-w-36 truncate rounded-md px-2 py-1 text-sm font-bold text-black-jewel transition duration-200 hover:text-gold sm:block"
            >
              <span>Olá, {username}</span>
              <br />
              <span className="text-xs text-gold">Minha Conta</span>
            </Link>
            <AccountMenu />
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/blog"
              className="text-sm font-bold text-black-jewel transition hover:text-gold md:hidden"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-gold/55 bg-gold px-5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(20,17,14,0.08)] transition duration-200 hover:border-gold hover:bg-gold/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden h-11 shrink-0 items-center justify-center rounded-md border border-gold/55 bg-emerald px-5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(20,17,14,0.08)] transition duration-200 hover:border-gold hover:bg-gold/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:inline-flex"
            >
              Registre-se
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
