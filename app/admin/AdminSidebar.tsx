"use client";

import {
  ClipboardList,
  Crown,
  Flag,
  Hourglass,
  Headset,
  Images,
  LogOut,
  Menu,
  Rocket,
  ShieldCheck,
  Siren,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  { href: "/admin/profiles", label: "Todos os perfis", icon: UsersRound },
  { href: "/admin/approvals", label: "Aprovações", icon: ShieldCheck },
  { href: "/admin/photo-moderation", label: "Validação de fotos", icon: Images },
  { href: "/admin/waiting", label: "Lista de espera", icon: Hourglass },
  { href: "/admin/featured", label: "Perfis em destaque", icon: Star },
  { href: "/admin/premium", label: "Premium e Premiere", icon: Crown },
  { href: "/admin/boosts", label: "Boosts", icon: Rocket },
  { href: "/admin/chat-reports", label: "Denúncias do chat", icon: Flag },
  { href: "/admin/support", label: "Atendimentos", icon: Headset },
  { href: "/admin/security-incidents", label: "Incidentes", icon: Siren },
  { href: "/admin/activity-logs", label: "Logs de atividade", icon: ClipboardList },
];

export function AdminSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/admin/login") return children;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <button
        type="button"
        aria-label="Abrir menu administrativo"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-full bg-[var(--espresso)] text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <button
          type="button"
          aria-label="Fechar menu administrativo"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[var(--espresso)] text-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={178}
            height={60}
            className="h-auto brightness-0 invert"
            priority
          />
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-3 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--gold-soft)]">
            Área privada
          </p>
          <p className="mt-1 text-sm text-white/55">Painel administrativo</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6" aria-label="Menu administrativo">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin/approvals" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
                  active
                    ? "bg-[var(--gold)] text-white shadow-[0_8px_24px_rgba(185,138,56,0.25)]"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-[var(--gold-soft)]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/65 transition-colors hover:bg-[var(--ruby)] hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair do painel
          </button>
        </div>
      </aside>

      <div className="admin-shell-content min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
