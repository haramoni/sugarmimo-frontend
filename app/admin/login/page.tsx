"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Login administrativo inválido.");
      }

      router.push("/admin/profiles");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login administrativo inválido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    router.push("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120b08] text-white">
      <Image
        src="/brand/hero-trio-hq-4k.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[44%_center]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,6,4,0.2)_0%,rgba(10,6,4,0.5)_48%,rgba(18,11,8,0.96)_66%,#120b08_100%)] max-lg:bg-[linear-gradient(180deg,rgba(10,6,4,0.62),rgba(18,11,8,0.98)_54%)]"
      />

      <div className="relative z-10 grid min-h-screen min-h-[100svh] lg:grid-cols-[minmax(0,1.15fr)_minmax(430px,0.85fr)]">
        <section className="hidden flex-col justify-between p-10 lg:flex xl:p-14">
          <Image
            src="/brand/logo-dark-bg.webp"
            alt="SugarMimo"
            width={245}
            height={58}
            priority
            className="h-auto w-56"
          />

          <div className="max-w-xl pb-3">
            <div className="mb-5 h-px w-20 bg-[linear-gradient(90deg,var(--gold-soft),transparent)]" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--gold-soft)]">
              Gestão SugarMimo
            </p>
            <h1 className="mt-3 max-w-lg font-heading text-4xl font-bold leading-[1.08] text-white xl:text-5xl">
              Segurança e cuidado em cada decisão.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/68">
              Ambiente exclusivo para moderação, atendimento e gestão da
              comunidade SugarMimo.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:bg-[#120b08]/88 lg:px-12 xl:px-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(222,166,83,0.12),transparent_30%)]"
          />

          <div className="relative w-full max-w-md rounded-3xl border border-white/12 bg-[#1b110d]/92 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div className="mb-8 lg:hidden">
              <Image
                src="/brand/logo-dark-bg.webp"
                alt="SugarMimo"
                width={230}
                height={54}
                priority
                className="h-auto w-48"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
              <ShieldCheck className="h-3.5 w-3.5" /> Área protegida
            </div>
            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Acesso administrativo
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Entre com suas credenciais autorizadas para acessar o painel.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="identifier"
                  className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/65"
                >
                  Usuário ou e-mail
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Digite seu acesso administrativo"
                  className="h-13 rounded-xl border-white/14 bg-white/7 px-4 text-white placeholder:text-white/28 focus-visible:border-[var(--gold)] focus-visible:ring-[var(--gold)]/25"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/65"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    className="h-13 rounded-xl border-white/14 bg-white/7 px-4 pr-12 text-white placeholder:text-white/28 focus-visible:border-[var(--gold)] focus-visible:ring-[var(--gold)]/25"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? "Esconder senha" : "Mostrar senha"
                    }
                    className="absolute right-1 top-1 h-11 w-11 rounded-lg text-white/45 hover:bg-white/8 hover:text-white"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-300/20 bg-red-500/12 px-4 py-3 text-sm font-bold leading-5 text-red-100"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-13 w-full rounded-xl border border-[#f3ce8a]/45 bg-[linear-gradient(135deg,#edc87f,#b9822f)] text-sm font-extrabold text-[#24150c] shadow-[0_16px_34px_rgba(185,130,47,0.24)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#f6d99d,#c99037)] disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {isSubmitting ? "Verificando acesso..." : "Entrar no painel"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full rounded-xl text-sm font-bold text-white/52 hover:bg-white/7 hover:text-white"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao site
              </Button>
            </form>

            <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-white/32">
              <ShieldCheck className="h-3.5 w-3.5" /> Acesso monitorado e
              restrito à equipe autorizada.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
