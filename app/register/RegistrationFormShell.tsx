"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { RegisterStepDots } from "./RegisterStepDots";

type RegistrationFormShellProps = {
  currentStep?: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  aside?: ReactNode;
  size?: "compact" | "standard" | "wide";
};

export function RegistrationFormShell({
  currentStep,
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  onBack,
  backLabel = "Voltar",
  aside,
  size = "standard",
}: RegistrationFormShellProps) {
  return (
    <main className="registration-stage">
      <section
        className={`registration-account-card registration-flow-card is-${size}`}
      >
        {currentStep ? (
          <div className="registration-account-progress">
            <RegisterStepDots currentStep={currentStep} />
          </div>
        ) : null}

        <header className="registration-account-header">
          <div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="registration-back-link"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel}
              </button>
            ) : null}

            <p className="registration-eyebrow">
              <Icon className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {aside === null ? null : (
            aside ?? (
              <div className="registration-security-note">
                <ShieldCheck className="h-5 w-5" />
                <span>
                  <strong>Ambiente seguro</strong>
                  Seus dados são tratados com privacidade
                </span>
              </div>
            )
          )}
        </header>

        <div className="registration-flow-content">{children}</div>
      </section>
    </main>
  );
}
