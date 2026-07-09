"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { removeAuthUser } from "@/app/lib/auth-storage";
import { clearRegisterFlow } from "../register-flow";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isClearingSession, setIsClearingSession] = useState(false);

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
      <section className="w-full max-w-[520px] bg-surface px-5 py-7 text-center shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-7">
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
