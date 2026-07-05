"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { setRegisterStep } from "./register-flow";

const registerSteps = [
  { label: "Perfil", href: "/register" },
  { label: "Conta", href: "/register/basic-info" },
  { label: "Aparência", href: "/register/how-you-are" },
  { label: "Preferências", href: "/register/almost-there" },
  { label: "Contatos", href: "/register/social-contacts" },
  { label: "Fotos", href: "/register/profile-photos" },
];

type RegisterStepDotsProps = {
  currentStep: string;
};

export function RegisterStepDots({ currentStep }: RegisterStepDotsProps) {
  const router = useRouter();
  const currentIndex = registerSteps.findIndex(
    (step) => step.href === currentStep,
  );

  function goToStep(href: string) {
    setRegisterStep(href);
    router.push(href);
  }

  return (
    <nav
      aria-label="Etapas do cadastro"
      className="grid grid-cols-6 gap-x-2"
    >
      <div className="col-span-6 grid grid-cols-subgrid">
        {registerSteps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index < currentIndex;
          const canNavigate = index <= currentIndex;

          return (
            <div
              key={step.href}
              className="relative flex flex-col items-center gap-2"
            >
              <button
                type="button"
                aria-label={`Ir para etapa ${step.label}`}
                aria-current={isCurrent ? "step" : undefined}
                disabled={!canNavigate}
                onClick={() => goToStep(step.href)}
                className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition",
                  isCurrent
                    ? "border-gold bg-gold text-white"
                    : isDone
                      ? "border-emerald bg-emerald text-white hover:bg-emerald/80"
                      : "border-silver bg-white text-silver",
                  canNavigate ? "cursor-pointer" : "cursor-not-allowed",
                ].join(" ")}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </button>

              {index < registerSteps.length - 1 ? (
                <span
                  className={[
                    "absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-0.5 rounded-full",
                    index < currentIndex
                      ? "bg-emerald"
                      : "bg-[color-mix(in_srgb,var(--silver)_54%,white)]",
                  ].join(" ")}
                />
              ) : null}

              <span
                className={[
                  "min-h-4 text-center text-[0.68rem] font-bold leading-tight text-[color-mix(in_srgb,var(--black)_58%,transparent)]",
                  isCurrent ? "text-gold" : "",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
