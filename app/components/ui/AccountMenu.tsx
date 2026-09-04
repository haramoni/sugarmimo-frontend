"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  CreditCard,
  LogOut,
  Mail,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "../AuthProvider";

export function AccountMenu() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  const normalizedRole = user.role?.trim().toUpperCase();
  const canPurchasePlan = ["SUGAR_DADDY", "SUGAR_MOMMY"].includes(
    normalizedRole ?? "",
  );

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Abrir menu da conta"
          className="h-11 w-11 rounded-full border-[#b98a38]/70 bg-[#050504] text-[#d6aa54] shadow-[0_0_12px_rgba(185,138,56,0.1)] hover:border-[#e1bd8a] hover:bg-[#120e08] hover:text-[#f1d28d]"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        className="bottom-0 left-auto right-0 top-0 h-dvh max-h-none w-[min(90vw,24rem)] max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none rounded-l-[2rem] border-l border-[color:color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[var(--surface)] p-0 shadow-[-24px_0_70px_rgba(20,17,14,0.18)] sm:max-w-none"
      >
        <DialogHeader className="border-b border-[color:color-mix(in_srgb,var(--gold)_24%,transparent)] px-6 pb-6 pt-8 text-left">
          <DialogTitle className="font-serif text-2xl font-semibold text-[var(--black)]">
            Sua Conta
          </DialogTitle>
          <DialogDescription className="text-[color:color-mix(in_srgb,var(--black)_58%,var(--silver))]">
            Acesse seu perfil e suas configurações.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
          <div className="rounded-3xl border border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] bg-white/65 p-4 shadow-[0_14px_35px_rgba(20,17,14,0.06)]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--emerald)_12%,white)] text-[var(--emerald)]">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[var(--black)]">
                  {user.username || "Minha conta"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[color:color-mix(in_srgb,var(--black)_55%,var(--silver))]">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email || "E-mail não disponível"}
                </p>
              </div>
            </div>
          </div>

          {canPurchasePlan ? (
            <DialogClose asChild>
              <Link
                href="/planos"
                className="group mt-5 flex min-h-20 items-center gap-3 rounded-3xl border border-[#ff8b9b] bg-[linear-gradient(135deg,#f34460_0%,#cf1538_52%,#920920_100%)] px-5 py-4 text-white shadow-[0_0_24px_rgba(239,42,76,0.42),0_16px_34px_rgba(92,9,31,0.24),inset_0_1px_0_rgba(255,225,230,0.42)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6079]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/35 bg-white/15 shadow-inner">
                  <CreditCard className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black uppercase tracking-[0.08em]">
                    Assinar um plano
                  </span>
                  <span className="mt-1 block text-xs font-medium text-white/80">
                    Escolha sua assinatura
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </DialogClose>
          ) : null}

          <div className="mt-5 space-y-2">
            <DialogClose asChild>
              <Link
                href="/perfil"
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-bold text-[var(--black)] transition hover:bg-white hover:text-[var(--emerald)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emerald)]"
              >
                <UserRound className="h-5 w-5" />
                Meu Perfil
              </Link>
            </DialogClose>
            <DialogClose asChild>
              <Link
                href="/configuracoes"
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-bold text-[var(--black)] transition hover:bg-white hover:text-[var(--emerald)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emerald)]"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
            </DialogClose>
          </div>

          <div className="mt-auto border-t border-[color:color-mix(in_srgb,var(--gold)_22%,transparent)] pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleLogout()}
              className="h-12 w-full justify-start rounded-2xl px-4 font-extrabold text-[var(--ruby)] hover:bg-[color:color-mix(in_srgb,var(--ruby)_10%,white)] hover:text-[var(--ruby)]"
            >
              <LogOut className="h-5 w-5" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
