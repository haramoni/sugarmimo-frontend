"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Copy, MailCheck, MessageCircle, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { removeAuthUser } from "@/app/lib/auth-storage";
import { useAuth } from "@/app/components/AuthProvider";
import {
  APPROVAL_PRIORITY_PIX_COPY_PASTE,
  APPROVAL_PRIORITY_PRICE_DISPLAY,
  approvalPriorityPaymentWhatsappUrl,
} from "@/lib/contact";
import { clearRegisterFlow } from "../register-flow";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(APPROVAL_PRIORITY_PIX_COPY_PASTE);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  async function goToLogin() {
    setIsClearingSession(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    clearRegisterFlow();
    removeAuthUser();
    window.dispatchEvent(new Event("sugarmimo-auth"));
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-5 py-10 text-black-jewel">
      <section className="w-full max-w-[620px] bg-surface px-5 py-7 text-center shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-7">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold bg-[color-mix(in_srgb,var(--gold-soft)_38%,white)] text-gold">
          <MailCheck className="h-8 w-8" />
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Cadastro enviado
          </p>
          <h1 className="text-2xl font-bold text-black-jewel">
            Seu perfil está em análise
          </h1>
          <p className="text-sm leading-6 text-[color:color-mix(in_srgb,var(--black)_68%,transparent)]">
            Nossa equipe vai revisar suas informações e fotos antes de liberar
            seu acesso ao SugarMimo. Assim que o perfil for aprovado, você
            poderá entrar normalmente.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 border-y border-silver py-4 text-sm font-bold text-black-jewel">
          <Clock className="h-4 w-4 text-gold" />
          Aprovação manual pendente
        </div>

        <div className="mt-6 rounded-xl border border-gold/45 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--gold-soft)_36%,white),white)] p-5 text-left shadow-[0_14px_35px_rgba(20,17,14,0.08)]">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-white">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
                Análise prioritária
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-black-jewel">
                Entre primeiro na fila por {APPROVAL_PRIORITY_PRICE_DISPLAY}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-black-jewel/70">
                Faça o PIX, envie o comprovante pelo WhatsApp e nossa equipe
                marcará seu perfil como prioritário após a conferência.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyPixCode()}
              className="h-12 rounded-sm border-gold/55 bg-white font-extrabold text-black-jewel hover:bg-gold-soft/35"
            >
              {copyStatus === "copied" ? (
                <Check className="h-4 w-4 text-emerald" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copyStatus === "copied" ? "PIX copiado" : "Copiar PIX de R$ 30"}
            </Button>
            <Button
              asChild
              className="h-12 rounded-sm bg-emerald font-extrabold text-white hover:bg-emerald/85"
            >
              <a
                href={approvalPriorityPaymentWhatsappUrl(user?.username)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar comprovante
              </a>
            </Button>
          </div>

          {copyStatus === "error" ? (
            <p className="mt-3 text-xs font-bold text-ruby">
              Não foi possível copiar automaticamente. Tente novamente em
              outro navegador ou fale com o atendimento pelo WhatsApp.
            </p>
          ) : null}

          <p className="mt-4 border-t border-gold/25 pt-3 text-xs font-semibold leading-5 text-black-jewel/65">
            O pagamento antecipa a análise, mas não garante a aprovação do
            perfil. Todos continuam sujeitos aos mesmos critérios de segurança
            e verificação.
          </p>
        </div>

        <Button
          type="button"
          disabled={isClearingSession}
          onClick={() => void goToLogin()}
          className="mt-6 h-12 w-full rounded-sm bg-emerald text-base font-bold text-white hover:bg-emerald/80 hover:text-surface"
        >
          {isClearingSession ? "Limpando acesso..." : "Ir para o login"}
        </Button>
      </section>
    </main>
  );
}
