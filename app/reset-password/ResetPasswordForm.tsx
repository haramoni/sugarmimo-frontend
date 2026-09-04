"use client";

import Link from "next/link";
import { type FormEvent, useState, useSyncExternalStore } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const token = useSyncExternalStore(subscribeToHash, readResetToken, () => "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Este link de recuperação está incompleto.");
      return;
    }
    if (password !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          String(result?.message || "Não foi possível redefinir a senha."),
        );
      }

      setPassword("");
      setConfirmation("");
      window.history.replaceState(null, "", window.location.pathname);
      setSuccess("Senha redefinida. Agora você já pode entrar com segurança.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-16">
      <div className="premium-surface-card w-full rounded-3xl p-7 md:p-10">
        <div className="premium-icon-medallion mb-7 h-12 w-12 rounded-2xl">
          <KeyRound aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-4xl text-luxury-ivory">
          Criar nova senha
        </h1>
        <p className="mt-3 text-sm leading-6 text-luxury-muted">
          O link funciona uma única vez. Ao concluir, as sessões antigas da sua
          conta serão encerradas.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-luxury-ivory">
              Nova senha
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting || Boolean(success)}
              className="premium-field h-12 rounded-xl"
            />
            <p className="text-xs text-luxury-muted/80">
              Use maiúscula, minúscula, número e caractere especial.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-luxury-ivory">
              Confirmar nova senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={isSubmitting || Boolean(success)}
              className="premium-field h-12 rounded-xl"
            />
          </div>
          <div className="space-y-3 flex justify-center">
            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-ruby/50 bg-ruby/10 px-4 py-3 text-sm font-semibold text-[#f0a5b3]"
              >
                {error}
              </p>
            ) : null}
            {success ? (
              <p
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald/45 bg-emerald/12 px-4 py-3 text-sm font-semibold text-[#78d6c0]"
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                {success}
              </p>
            ) : null}

            {success ? (
              <Button
                asChild
                className="premium-primary-action h-12 w-full rounded-full"
              >
                <Link href="/login">Ir para o login</Link>
              </Button>
            ) : (
              <Button
                className="premium-primary-action h-12 w-full rounded-full"
                type="submit"
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function readResetToken() {
  return (
    new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token") ??
    ""
  );
}

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
