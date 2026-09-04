"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useAuth } from "../AuthProvider";
import { Navbar } from "./Navbar";

const menuItems = [
  { label: "O Clube", href: "/#clube" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Perfis", href: "/#perfis" },
  { label: "Experiências", href: "/#experiencias" },
  { label: "FAQ", href: "/#faq" },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  if (user) {
    return <Navbar />;
  }

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 border-b border-[#e1bd8a]/15 bg-[#080808]/80 backdrop-blur-xl",
        pathname === "/" ? "sm-nav-enter" : "",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-5 sm:gap-6 sm:px-10">
        <Link
          href="/"
          aria-label="SugarMimo"
          className="flex shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a]"
        >
          <Image
            src="/brand/logo-dark-bg.webp"
            alt="SugarMimo"
            width={180}
            height={42}
            priority
            className="h-auto w-32 object-contain sm:w-40"
            style={{ height: "auto" }}
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {menuItems.map((item) => {
            const active = isActivePath(pathname, hash, item.href);
            const isPlansCallout = item.href === "/planos";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  window.dispatchEvent(new Event("sugarmimo-hash"))
                }
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
                  isPlansCallout
                    ? "rounded-full border border-[#ff8798] bg-[linear-gradient(180deg,#f34460_0%,#cf1538_55%,#970b26_100%)] px-4 py-2 text-white shadow-[0_0_18px_rgba(239,42,76,0.58),0_7px_20px_rgba(0,0,0,0.36)] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-[#ff8798]"
                    : "rounded-sm py-2 text-[#d0d0d0]/75 hover:text-[#e1bd8a] focus-visible:outline-[#e1bd8a]",
                ].join(" ")}
              >
                {item.label}
                {!isPlansCallout ? (
                  <span
                    className={[
                      "absolute inset-x-0 -bottom-1 mx-auto h-px rounded-full bg-[#e1bd8a] transition-all duration-200",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    ].join(" ")}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 shrink-0 items-center justify-center px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d0d0d0]/80 transition hover:text-[#e1bd8a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a] sm:px-3"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="hidden h-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3d7aa_0%,#e1bd8a_52%,#9c7443_125%)] px-5 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[#0b0a09] shadow-[0_8px_26px_rgba(225,189,138,0.18)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a] sm:inline-flex"
          >
            Tornar-se membro
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e1bd8a]/22 text-[#e1bd8a] transition hover:border-[#e1bd8a]/60 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <nav
          aria-label="Menu móvel"
          className="border-t border-[#e1bd8a]/12 bg-[#080808]/96 px-6 py-7 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {menuItems.map((item) => {
              const isPlansCallout = item.href === "/planos";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new Event("sugarmimo-hash"));
                  }}
                  className={
                    isPlansCallout
                      ? "my-2 rounded-xl border border-[#ff8798] bg-[linear-gradient(180deg,#f34460_0%,#cf1538_55%,#970b26_100%)] px-4 py-3 text-center font-sans text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_0_20px_rgba(239,42,76,0.56)] transition hover:brightness-110"
                      : "border-b border-[#e1bd8a]/10 py-3 font-serif text-xl text-[#e6ded1] transition hover:text-[#e1bd8a]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="sm-luxury-button mt-5 w-full"
            >
              Tornar-se membro
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
