"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const AGE_CONFIRMATION_KEY = "sugarmimo_age_confirmation";
const AGE_CONFIRMATION_VERSION = "v1.18-plus";
const AGE_CONFIRMATION_EVENT = "sugarmimo-age-confirmation";

function subscribeToAgeConfirmation(callback: () => void) {
  window.addEventListener(AGE_CONFIRMATION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AGE_CONFIRMATION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function needsAgeConfirmation() {
  try {
    return (
      window.localStorage.getItem(AGE_CONFIRMATION_KEY) !==
      AGE_CONFIRMATION_VERSION
    );
  } catch {
    return true;
  }
}

function saveAgeConfirmation() {
  try {
    window.localStorage.setItem(AGE_CONFIRMATION_KEY, AGE_CONFIRMATION_VERSION);
  } finally {
    window.dispatchEvent(new Event(AGE_CONFIRMATION_EVENT));
  }
}

export function AgeConfirmationDialog() {
  const pathname = usePathname();
  const isExemptPath = ["/manutencao", "/privacy", "/terms"].includes(pathname);
  const [isChecked, setIsChecked] = useState(false);
  const isVisible = useSyncExternalStore(
    subscribeToAgeConfirmation,
    needsAgeConfirmation,
    () => false,
  );

  useEffect(() => {
    if (!isVisible || isExemptPath) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isExemptPath, isVisible]);

  if (!isVisible || isExemptPath) return null;

  function handleConfirmation() {
    if (!isChecked) return;
    saveAgeConfirmation();
  }

  function handleUnderageExit() {
    window.location.replace("https://www.google.com/");
  }

  return (
    <div className="fixed inset-0 z-200 grid min-h-dvh place-items-center overflow-y-auto bg-[rgba(20,17,14,0.76)] px-4 py-8 backdrop-blur-md sm:px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-confirmation-title"
        aria-describedby="age-confirmation-description"
        className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/55 bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] shadow-[0_30px_100px_rgba(20,17,14,0.48)]"
      >
        <div className="h-1.5 bg-linear-to-r from-emerald via-gold to-ruby" />

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <span className="mx-auto grid h-18 w-18 place-items-center rounded-[1.5rem] bg-emerald text-white shadow-[0_16px_38px_rgba(0,108,88,0.24)]">
            <ShieldCheck aria-hidden="true" className="h-9 w-9" />
          </span>

          <div className="mt-6 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
              Ambiente exclusivo para adultos
            </p>
            <h1
              id="age-confirmation-title"
              className="mt-3 font-heading text-3xl font-bold text-espresso sm:text-4xl"
            >
              Você tem 18 anos ou mais?
            </h1>
            <p
              id="age-confirmation-description"
              className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-black-jewel/65 sm:text-base"
            >
              O SugarMimo é uma plataforma de relacionamento destinada somente a
              pessoas adultas.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/7 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Checkbox
                id="age-confirmation"
                autoFocus
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked === true)}
                className="mt-0.5 size-5 border-2 border-cognac/45 bg-white data-checked:border-emerald data-checked:bg-emerald"
              />
              <Label
                htmlFor="age-confirmation"
                className="cursor-pointer text-sm font-bold leading-6 text-espresso sm:text-base"
              >
                Confirmo que tenho 18 anos completos ou mais.
              </Label>
            </div>
          </div>

          <Button
            type="button"
            disabled={!isChecked}
            onClick={handleConfirmation}
            className="mt-5 h-12 w-full rounded-full bg-emerald text-base font-extrabold text-white shadow-[0_14px_30px_rgba(0,108,88,0.2)] hover:bg-emerald/85 disabled:bg-silver disabled:text-black-jewel/45 disabled:shadow-none"
          >
            Entrar no SugarMimo
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={handleUnderageExit}
            className="mx-auto mt-4 block text-sm font-bold text-black-jewel/52 underline decoration-silver underline-offset-4 transition hover:text-ruby"
          >
            Não tenho 18 anos
          </button>

          <p className="mt-6 text-center text-xs font-medium leading-5 text-black-jewel/52">
            Ao continuar, você declara cumprir o requisito de maioridade dos{" "}
            <Link
              href="/terms"
              className="font-extrabold text-emerald underline decoration-emerald/35 underline-offset-3"
            >
              Termos de Uso
            </Link>{" "}
            e reconhece nossa{" "}
            <Link
              href="/privacy"
              className="font-extrabold text-emerald underline decoration-emerald/35 underline-offset-3"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
