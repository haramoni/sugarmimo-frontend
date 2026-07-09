"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Perfil", href: "/perfil" },
  { label: "Chat", href: "/chat" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const loggedMenuItems =
    user?.role === "SUGAR_BABY"
      ? [...menuItems, { label: "Buscar", href: "/buscar" }]
      : menuItems;

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_88%,white)] px-4 py-3 shadow-[0_10px_34px_rgba(20,17,14,0.08)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <nav className="mx-auto grid max-w-7xl items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="group flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emerald)]"
        >
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--gold)_54%,var(--silver))] bg-[linear-gradient(145deg,var(--surface),color-mix(in_srgb,var(--gold-soft)_24%,white))] shadow-[0_12px_28px_rgba(185,138,56,0.14)] transition duration-300 group-hover:border-[var(--emerald)]">
            <span className="absolute inset-1 rounded-full border border-[color-mix(in_srgb,var(--silver)_58%,transparent)]" />
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
            <span className="block font-serif text-2xl font-semibold text-[var(--black)] transition duration-300 group-hover:text-silver">
              Sugar<span className="text-[var(--gold)]">Mimo</span>
            </span>
            <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--black)_52%,var(--silver))] sm:block">
              Private Social Club
            </span>
          </span>
        </Link>

        <div className="order-3 flex gap-1.5 overflow-x-auto rounded-full border border-[color:color-mix(in_srgb,var(--silver)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_78%,white)] p-1.5 text-sm font-bold text-[color-mix(in_srgb,var(--black)_68%,var(--silver))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_16px_42px_rgba(20,17,14,0.08)] backdrop-blur-2xl lg:order-none lg:justify-center">
          {loggedMenuItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative shrink-0 rounded-full px-4 py-2.5 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emerald)]",
                  active
                    ? "bg-silver text-white shadow-[0_10px_24px_rgba(0,108,88,0.22)]"
                    : "hover:bg-[color:color-mix(in_srgb,var(--gold-soft)_28%,white)] hover:text-[var(--black)]",
                ].join(" ")}
              >
                <span className="relative z-10">{item.label}</span>
                {active ? (
                  <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-[linear-gradient(90deg,var(--silver),var(--gold-soft),white)]" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="justify-self-end sm:flex">
          <Button
            type="button"
            onClick={handleLogout}
            className="h-auto min-h-12 w-full rounded-full border border-white/28 px-4 py-2 text-sm font-extrabold text-white hover:bg-ruby hover:text-white sm:text-base"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </nav>
    </header>
  );
}
