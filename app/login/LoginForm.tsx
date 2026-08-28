"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  CrownIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { ModalForgotPassword } from "./ModalForgotPassword";
import { saveAuthUser } from "../lib/auth-storage";
import {
  pendingModerationNotice,
  type ModerationNotice,
} from "../lib/auth";
import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";
import { AccountModerationDialog } from "../components/AccountModerationDialog";

const REAPPLICATION_ROUTE = "/register/reapply";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationNotice, setModerationNotice] =
    useState<ModerationNotice | null>(null);
  const [moderationNextRoute, setModerationNextRoute] = useState<string | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = String(result?.message ?? "");

        if (
          result?.code === "ACCOUNT_RESTRICTED" &&
          result.moderationNotice?.reason
        ) {
          setModerationNextRoute(null);
          setModerationNotice(result.moderationNotice as ModerationNotice);
          return;
        }

        if (message.toLowerCase().includes("pending")) {
          router.replace(PENDING_APPROVAL_ROUTE);
          return;
        }

        if (response.status >= 500) {
          throw new Error(
            message || "Não foi possível conectar ao servidor agora.",
          );
        }

        throw new Error("Usuário, e-mail ou senha inválidos.");
      }

      if (!result?.user) {
        throw new Error("Resposta de login inválida.");
      }

      saveAuthUser(result.user);
      if (result.requiresReapplication) {
        setModerationNextRoute(REAPPLICATION_ROUTE);
        setModerationNotice(
          (result.moderationNotice as ModerationNotice | null) ??
            pendingModerationNotice(result.user),
        );
        return;
      }

      if (shouldShowPendingApproval(result.user)) {
        const pendingNotice = pendingModerationNotice(result.user);
        if (pendingNotice) {
          setModerationNextRoute(PENDING_APPROVAL_ROUTE);
          setModerationNotice(pendingNotice);
          return;
        }
        window.location.replace(PENDING_APPROVAL_ROUTE);
        return;
      }

      if (result.user.gender?.trim().toLowerCase() === "sugar-baby-woman") {
        window.sessionStorage.setItem("sugarmimo-chat-online-toast", "1");
      }

      window.location.replace("/inicio");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sm-grain relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 py-12 text-[#f4ecdf]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(112,81,39,0.24),transparent_55%)]" />
      <Card className="relative w-full max-w-sm rounded-[1.5rem] border border-[#e1bd8a]/18 bg-[#11100e]/92 text-[#f4ecdf] shadow-[0_28px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <CardHeader className="flex flex-col items-center gap-2 px-7 pt-9">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Voltar para a página inicial"
            className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a]"
          >
            <Image
              src="/brand/monogram-champagne.webp"
              alt="SugarMimo"
              width={64}
              height={39}
              priority
              className="h-auto w-16 select-none object-contain"
            />
          </button>
          <h1 className="mt-5 font-serif text-3xl font-medium">
            Bem-vindo de volta
          </h1>
          <p className="text-center text-sm text-[#969189]">
            Acesse sua área privada de membro.
          </p>
        </CardHeader>

        <CardContent className="px-7 pb-8 pt-4">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#c7c2b9]"
              >
                Nome de usuário ou e-mail
              </Label>
              <Input
                id="username"
                name="identifier"
                type="text"
                required
                placeholder="Digite seu nome de usuário ou e-mail"
                className="h-12 rounded-xl border-[#e1bd8a]/18 bg-[#080808] px-4 text-[#f4ecdf] placeholder:text-[#6f6c67] focus-visible:border-[#e1bd8a]/60 focus-visible:ring-[#e1bd8a]/20"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#c7c2b9]"
              >
                Senha
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Digite sua senha"
                  className="h-12 rounded-xl border-[#e1bd8a]/18 bg-[#080808] px-4 pr-11 text-[#f4ecdf] placeholder:text-[#6f6c67] focus-visible:border-[#e1bd8a]/60 focus-visible:ring-[#e1bd8a]/20"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-[#969189] hover:bg-transparent hover:text-[#e1bd8a]"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-[#c85168]/30 bg-[#c85168]/10 px-4 py-3 text-sm font-semibold text-[#f0a5b3]">
                {error}
              </p>
            )}

            <Button
              className="h-12 w-full rounded-full bg-[linear-gradient(135deg,#f3d7aa_0%,#e1bd8a_50%,#9c7443_125%)] text-xs font-extrabold uppercase tracking-[0.2em] text-[#080808] shadow-[0_12px_34px_rgba(225,189,138,0.2)] transition hover:-translate-y-0.5 hover:opacity-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar no clube"}
            </Button>
          </form>
          <div className="mt-1 flex flex-row items-center justify-between text-xs">
            <ModalForgotPassword />
            <Link
              href="/register"
              className="mt-3 font-semibold text-[#e1bd8a] underline-offset-4 transition hover:underline"
            >
              <span>Cadastre-se agora</span>
            </Link>
          </div>
          <div className="mt-8 flex w-full items-center justify-between border-t border-[#e1bd8a]/12 pt-5 text-xs font-semibold text-[#77736d]">
            <Link
              href="/admin/login"
              aria-label="Acesso administrativo"
              className="flex items-center gap-2 transition hover:text-[#e1bd8a]"
            >
              <CrownIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 transition hover:text-[#e1bd8a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </CardContent>
      </Card>
      <AccountModerationDialog
        key={moderationNotice?.appliedAt ?? "blocked-moderation-notice"}
        open={Boolean(moderationNotice)}
        notice={moderationNotice}
        blocked={!moderationNextRoute}
        confirmLabel={
          moderationNextRoute === REAPPLICATION_ROUTE
            ? "Corrigir cadastro e tentar novamente"
            : undefined
        }
        onConfirm={() => {
          if (moderationNextRoute) {
            window.location.replace(moderationNextRoute);
            return;
          }
          setModerationNotice(null);
        }}
      />
    </div>
  );
}
