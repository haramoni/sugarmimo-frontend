"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Crown, Heart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSavedRegisterStep, setRegisterStep } from "./register-flow";
import { RegisterStepDots } from "./RegisterStepDots";

type ProfileCategory = "daddy" | "baby";

export default function Register() {
  const router = useRouter();
  const [profileCategory, setProfileCategory] =
    useState<ProfileCategory | null>(null);

  useEffect(() => {
    const savedStep = getSavedRegisterStep();

    if (savedStep && savedStep !== "/register") {
      router.replace(savedStep);
      return;
    }

    setRegisterStep("/register");
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const profileType = String(formData.get("profile-type") ?? "");
    const interest = String(formData.get("interest") ?? "");

    localStorage.setItem(
      "sugarmimo:register-step-one",
      JSON.stringify({
        profileType,
        interest,
      }),
    );

    setRegisterStep("/register/basic-info");
    router.push("/register/basic-info");
  }

  if (!profileCategory) {
    return (
      <main className="min-h-screen bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[rgba(20,17,14,0.25)] px-5 py-12">
          <div className="absolute left-[8%] top-[12%] h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] right-[8%] h-56 w-56 rounded-full bg-emerald/20 blur-3xl" />

          <div className="relative w-full max-w-170">
            <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_28px_90px_rgba(20,17,14,0.32)] backdrop-blur-xl">
              <div className="h-1.5 bg-linear-to-r from-emerald via-gold to-ruby" />

              <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[0.7rem] font-extrabold tracking-[0.18em] text-cognac uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Seu cadastro começa aqui
                </span>

                <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-espresso sm:text-5xl">
                  Quero ser...
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black-jewel/65 sm:text-base">
                  Escolha como você quer viver a experiência SugarMimo.
                </p>

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setProfileCategory("daddy")}
                    className="group relative overflow-hidden rounded-2xl border border-[#315a7b] bg-linear-to-br from-[#0c2238] to-[#173f5f] p-6 text-left shadow-[0_12px_30px_rgba(12,34,56,0.22)] transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_18px_38px_rgba(12,34,56,0.34)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  >
                    <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-gold/40 bg-white/10 text-gold-soft shadow-lg transition group-hover:scale-105">
                      <Crown className="h-6 w-6" />
                    </span>
                    <span className="block font-heading text-2xl font-bold text-white">
                      Daddy
                    </span>
                    <span className="mt-1 block text-sm text-[#c9d7e3]">
                      Quero ser Sugar Daddy ou Sugar Mommy
                    </span>
                    <ChevronRight className="absolute bottom-6 right-5 h-5 w-5 text-gold-soft transition group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileCategory("baby")}
                    className="group relative overflow-hidden rounded-2xl border border-ruby/25 bg-linear-to-br from-[#fff8f8] to-[#f2d9df] p-6 text-left shadow-[0_12px_30px_rgba(125,23,50,0.1)] transition duration-300 hover:-translate-y-1 hover:border-ruby/60 hover:shadow-[0_18px_38px_rgba(125,23,50,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ruby"
                  >
                    <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-ruby text-white shadow-lg transition group-hover:scale-105">
                      <Heart className="h-6 w-6" />
                    </span>
                    <span className="block font-heading text-2xl font-bold text-espresso">
                      Baby
                    </span>
                    <span className="mt-1 block text-sm text-black-jewel/60">
                      Quero ser Sugar Baby
                    </span>
                    <ChevronRight className="absolute bottom-6 right-5 h-5 w-5 text-ruby transition group-hover:translate-x-1" />
                  </button>
                </div>

                <p className="mt-8 text-sm text-black-jewel/65">
                  Já possui uma conta?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-ruby transition hover:text-gold"
                  >
                    Acessar login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
      <section className="flex min-h-screen items-center justify-center bg-[rgba(20,17,14,0.18)] px-5 py-12">
        <div className="w-full max-w-125 space-y-6">
          <div className="rounded-sm bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_22px_60px_rgba(20,17,14,0.24)] backdrop-blur-sm">
            <div className="space-y-7 px-4 py-9 sm:px-6">
              <RegisterStepDots currentStep="/register" />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setProfileCategory(null)}
                  className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-black-jewel/55 transition hover:text-gold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Alterar escolha
                </button>
                <h1 className="text-2xl font-bold leading-tight text-black-jewel">
                  Comece seu cadastro SugarMimo
                </h1>
                <p className="text-sm font-medium text-emerald">
                  Entre para um grupo seleto de encontros exclusivos e
                  experiências únicas.
                </p>
              </div>

              <form className="space-y-7" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="profile-type"
                    className="block text-sm font-bold text-black-jewel"
                  >
                    Eu me identifico como
                  </label>
                  <select
                    key={profileCategory}
                    id="profile-type"
                    name="profile-type"
                    defaultValue=""
                    required
                    className="h-11 w-full border-0 border-b border-[color-mix(in_srgb,var(--silver)_80%,var(--black))] bg-transparent px-0 text-base text-black-jewel outline-none transition focus:border-gold focus:ring-0"
                  >
                    {profileCategory === "daddy" ? (
                      <>
                        <option value="" disabled>
                          Selecione seu perfil
                        </option>
                        <option value="sugar-daddy">Sugar Daddy</option>
                        <option value="sugar-mommy">Sugar Mommy</option>
                      </>
                    ) : (
                      <>
                        <option value="" disabled>
                          Selecione seu perfil
                        </option>
                        <option value="sugar-baby-woman">
                          Sugar Baby (Mulher)
                        </option>
                        <option value="sugar-baby-trans-woman">
                          Sugar Baby (Mulher trans)
                        </option>
                        <option value="sugar-baby-man">
                          Sugar Baby (Homem)
                        </option>
                        <option value="sugar-baby-man">
                          Sugar Baby (Homem Trans)
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="interest"
                    className="block text-sm font-bold text-black-jewel"
                  >
                    Busco conhecer
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    defaultValue=""
                    required
                    className="h-11 w-full border-0 border-b border-[color-mix(in_srgb,var(--silver)_80%,var(--black))] bg-transparent px-0 text-base text-black-jewel outline-none transition focus:border-gold focus:ring-0"
                  >
                    <option value="" disabled>
                      Escolha uma preferência
                    </option>
                    <option value="women">Mulheres</option>
                    <option value="men">Homens</option>
                    <option value="both">Todos</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-md bg-emerald text-base font-bold text-white shadow-[0_16px_34px_rgba(185,138,56,0.28)] hover:bg-emerald/80 hover:text-white"
                >
                  Continuar Cadastro
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-5 rounded-sm bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-5 text-xs leading-relaxed text-black-jewel shadow-[0_18px_48px_rgba(20,17,14,0.18)] backdrop-blur-sm sm:text-sm">
            <p>
              Ao prosseguir, você confirma que leu e aceita os nossos{" "}
              <Link
                href="/terms"
                className="font-bold underline decoration-gold underline-offset-2"
              >
                Termos de uso
              </Link>
              .
            </p>

            <p>
              O SugarMimo é exclusivo para pessoas maiores de 18 anos. Podemos
              solicitar validação de idade para manter a segurança da
              comunidade.
            </p>

            <p>
              A plataforma foi criada para encontros consensuais entre adultos e
              não permite atividades ilegais, exploração, comércio sexual ou
              qualquer conduta que coloque outras pessoas em risco.
            </p>

            <p className="pt-4">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="font-bold text-ruby transition hover:text-gold"
              >
                Acessar login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
