"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useAuth } from "../AuthProvider";
import { Navbar } from "./Navbar";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Como Funciona", href: "/#como-funciona" },
  { label: "Blog", href: "/blog" },
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

  if (user) {
    return <Navbar />;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-cognac/20 bg-cream/88 shadow-[0_8px_30px_rgba(36,21,13,0.12)] backdrop-blur-xl">
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

        <div className="hidden items-center gap-9 text-sm font-bold text-espresso md:flex">
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
                className="group relative whitespace-nowrap rounded-sm py-2 transition-colors duration-200 hover:text-cognac focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cognac"
              >
                {item.label}
                <span
                  className={[
                    "absolute inset-x-0 -bottom-1 mx-auto h-0.5 rounded-full bg-cognac transition-all duration-200",
                    active ? "w-full" : "w-0 group-hover:w-full",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/blog"
            className="text-sm font-bold text-black-jewel transition hover:text-gold md:hidden"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-cognac/35 bg-gold px-5 text-sm font-extrabold text-espresso shadow-[0_4px_14px_rgba(36,21,13,0.12)] transition duration-200 hover:border-cognac hover:bg-champagne focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cognac"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="hidden h-11 shrink-0 items-center justify-center rounded-md border border-espresso bg-espresso px-5 text-sm font-extrabold text-cream shadow-[0_4px_14px_rgba(36,21,13,0.18)] transition duration-200 hover:border-cognac hover:bg-cognac focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cognac sm:inline-flex"
          >
            Registre-se
          </Link>
        </div>
      </nav>
    </header>
  );
}
