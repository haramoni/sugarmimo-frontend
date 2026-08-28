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
      className="registration-stepper grid grid-cols-6 gap-x-2"
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
                  "registration-step-dot",
                  isCurrent
                    ? "is-current"
                    : isDone
                      ? "is-complete"
                      : "is-upcoming",
                  canNavigate ? "is-navigable" : "is-locked",
                ].join(" ")}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </button>

              {index < registerSteps.length - 1 ? (
                <span
                  className={[
                    "registration-step-line",
                    index < currentIndex ? "is-complete" : "",
                  ].join(" ")}
                />
              ) : null}

              <span
                className={[
                  "registration-step-label",
                  isCurrent ? "is-current" : "",
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
