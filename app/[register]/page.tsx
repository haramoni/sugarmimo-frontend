 "use client";

import { type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function Register() {
  const router = useRouter();

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
      })
    );

    router.push("/register/basic-info");
  }

  return (
    <main className="min-h-screen bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
      <section className="flex min-h-screen items-center justify-center bg-[rgba(20,17,14,0.18)] px-5 py-12">
        <div className="w-full max-w-125 space-y-6">
          <div className="rounded-sm bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_22px_60px_rgba(20,17,14,0.24)] backdrop-blur-sm">
            <div className="space-y-7 px-4 py-9 sm:px-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold leading-tight text-black-jewel">
                  Comece seu cadastro SugarMimo
                </h1>
                <p className="text-sm font-medium text-emerald">
                  Entre para um grupo seleto de encontros exclusivos e
                  experiencias unicas.
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
                    id="profile-type"
                    name="profile-type"
                    defaultValue=""
                    required
                    className="h-11 w-full border-0 border-b border-[color-mix(in_srgb,var(--silver)_80%,var(--black))] bg-transparent px-0 text-base text-black-jewel outline-none transition focus:border-gold focus:ring-0"
                  >
                    <option value="" disabled>
                      Selecione seu perfil
                    </option>
                    <option value="sugar-baby-woman">Sugar Baby (Mulher)</option>
                    <option value="sugar-baby-man">Sugar Baby (Homem)</option>
                    <option value="sugar-daddy">Sugar Daddy</option>
                    <option value="sugar-mommy">Sugar Mommy</option>
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
                      Escolha uma preferencia
                    </option>
                    <option value="women">Mulheres</option>
                    <option value="men">Homens</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-sm bg-gold text-base font-bold text-white shadow-[0_16px_34px_rgba(185,138,56,0.28)] hover:bg-[color-mix(in_srgb,var(--gold)_86%,var(--black))] hover:text-surface"
                >
                  Continuar cadastro
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-5 rounded-sm bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-5 text-xs leading-relaxed text-black-jewel shadow-[0_18px_48px_rgba(20,17,14,0.18)] backdrop-blur-sm sm:text-sm">
            <p>
              Ao prosseguir, voce confirma que leu e aceita os nossos{" "}
              <Link
                href="/terms"
                className="font-bold underline decoration-gold underline-offset-2"
              >
                Termos de uso
              </Link>
              .
            </p>

            <p>
              O SugarMimo e exclusivo para pessoas maiores de 18 anos. Podemos
              solicitar validacao de idade para manter a seguranca da
              comunidade.
            </p>

            <p>
              A plataforma foi criada para encontros consensuais entre adultos e
              não permite atividades ilegais, exploracao, comercio sexual ou
              qualquer conduta que coloque outras pessoas em risco.
            </p>

            <p className="pt-4">
              Ja possui uma conta?{" "}
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
