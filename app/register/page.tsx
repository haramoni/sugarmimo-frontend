"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Crown,
  Heart,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  captureReferralFromUrl,
  getSavedRegisterStep,
  setRegisterStep,
} from "./register-flow";
import { RegistrationFormShell } from "./RegistrationFormShell";
import { useRegistrationSecret } from "./RegistrationSecretProvider";
import {
  relationshipIntentOptions,
  type RelationshipIntent,
} from "../lib/relationship-intent";

type ProfileCategory = "daddy" | "baby";

export default function Register() {
  const router = useRouter();
  const { clearPassword } = useRegistrationSecret();
  const [profileCategory, setProfileCategory] =
    useState<ProfileCategory | null>(null);
  const [relationshipIntent, setRelationshipIntent] =
    useState<RelationshipIntent>("SUGAR");
  const [adultDeclarationAccepted, setAdultDeclarationAccepted] =
    useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyNoticeAcknowledged, setPrivacyNoticeAcknowledged] =
    useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    captureReferralFromUrl();
    const savedStep = getSavedRegisterStep();

    if (savedStep && savedStep !== "/register") {
      router.replace(savedStep);
      return;
    }

    clearPassword();
    setRegisterStep("/register");
  }, [clearPassword, router]);

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
        relationshipIntent,
        adultDeclarationAccepted,
        termsAccepted,
        privacyNoticeAcknowledged,
        marketingConsent,
      }),
    );

    setRegisterStep("/register/basic-info");
    router.push("/register/basic-info");
  }

  if (!profileCategory) {
    return (
      <RegistrationFormShell
        currentStep="/register"
        eyebrow="Etapa 1 de 6 · Perfil"
        title="Como você quer viver essa experiência?"
        description="Escolha o perfil que melhor representa você. Essa definição orienta as próximas etapas do cadastro."
        icon={Sparkles}
        onBack={() => router.push("/")}
        backLabel="Voltar para o início"
        size="wide"
      >
        <div className="registration-choice-content">
          <div className="registration-section-heading">
            <span>01</span>
            <div>
              <h2>Escolha seu perfil</h2>
              <p>Você poderá detalhar suas preferências na sequência.</p>
            </div>
          </div>

          <div className="registration-profile-choice-grid">
            <button
              type="button"
              onClick={() => setProfileCategory("daddy")}
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(8,8,8,.96), rgba(8,8,8,.2)), url('/brand/daddy-card.jpg')",
              }}
              className="registration-profile-card group"
            >
              <span className="registration-profile-card-icon">
                <Crown className="h-6 w-6" />
              </span>
              <span className="registration-profile-card-title">
                Daddy / Mommy
              </span>
              <span className="registration-profile-card-copy">
                Quero ser Sugar Daddy ou Sugar Mommy
              </span>
              <ChevronRight className="registration-profile-card-arrow" />
            </button>

            <button
              type="button"
              onClick={() => setProfileCategory("baby")}
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(8,8,8,.96), rgba(8,8,8,.2)), url('/brand/sugar-card.jpg')",
              }}
              className="registration-profile-card group"
            >
              <span className="registration-profile-card-icon">
                <Heart className="h-6 w-6" />
              </span>
              <span className="registration-profile-card-title">Baby</span>
              <span className="registration-profile-card-copy">
                Quero ser Sugar Baby
              </span>
              <ChevronRight className="registration-profile-card-arrow" />
            </button>
          </div>

          <p className="registration-login-note">
            Já possui uma conta? <Link href="/login">Acessar login</Link>
          </p>
        </div>
      </RegistrationFormShell>
    );
  }

  return (
    <RegistrationFormShell
      currentStep="/register"
      eyebrow="Etapa 1 de 6 · Perfil"
      title="Defina seu perfil"
      description="Conte como você se identifica e o tipo de conexão que deseja encontrar."
      icon={profileCategory === "daddy" ? Crown : Heart}
      onBack={() => setProfileCategory(null)}
      backLabel="Alterar escolha"
      size="wide"
    >
      <form className="registration-standard-form" onSubmit={handleSubmit}>
        <div className="registration-profile-setup-grid">
          <section className="registration-form-section registration-profile-section">
            <div className="registration-section-heading">
              <span>01</span>
              <div>
                <h2>Identidade e intenção</h2>
                <p>Essas escolhas aparecerão no seu perfil.</p>
              </div>
            </div>

            <div className="registration-fields-stack">
              <div className="registration-field">
                <label htmlFor="profile-type" className="registration-label">
                  Eu me identifico como
                </label>
                <select
                  key={profileCategory}
                  id="profile-type"
                  name="profile-type"
                  defaultValue=""
                  required
                  className="registration-native-select"
                >
                  {profileCategory === "daddy" ? (
                    <>
                      <option value="" disabled>
                        Selecione seu perfil
                      </option>
                      <option value="sugar-daddy">Homem</option>
                      <option value="sugar-mommy">Mulher</option>
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
                      <option value="sugar-baby-man">Sugar Baby (Homem)</option>
                      <option value="sugar-baby-trans-man">
                        Sugar Baby (Homem Trans)
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="registration-field">
                <label htmlFor="interest" className="registration-label">
                  Busco conhecer
                </label>
                <select
                  id="interest"
                  name="interest"
                  defaultValue=""
                  required
                  className="registration-native-select"
                >
                  <option value="" disabled>
                    Escolha uma preferência
                  </option>
                  <option value="women">Mulheres</option>
                  <option value="men">Homens</option>
                  <option value="both">Todos</option>
                </select>
              </div>

              <fieldset className="registration-field">
                <legend className="registration-label">
                  Que tipo de relacionamento você busca?
                </legend>
                <p className="registration-helper">
                  Sua escolha ficará visível no perfil e poderá ser alterada
                  depois.
                </p>
                <input
                  type="hidden"
                  name="relationship-intent"
                  value={relationshipIntent}
                />
                <div className="registration-intent-grid">
                  {relationshipIntentOptions.map((option) => {
                    const isSelected = relationshipIntent === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setRelationshipIntent(option.value)}
                        className={[
                          "registration-intent-option",
                          isSelected ? "is-selected" : "",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "registration-intent-icon",
                            isSelected ? "is-selected" : "",
                          ].join(" ")}
                        >
                          {option.value === "TRADITIONAL" ? (
                            <Heart className="h-4 w-4" />
                          ) : option.value === "BOTH" ? (
                            <HeartHandshake className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="registration-intent-title">
                            {option.label}
                          </span>
                          <span className="registration-intent-copy">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </section>

          <section className="registration-form-section registration-profile-section">
            <div className="registration-section-heading">
              <span>18+</span>
              <div>
                <h2>Segurança e consentimentos</h2>
                <p>Revise as declarações obrigatórias para continuar.</p>
              </div>
            </div>

            <fieldset className="registration-consent-panel">
              <legend className="registration-label px-1">
                Declarações e preferências
              </legend>

              <ConsentCheckbox
                id="adult-declaration"
                checked={adultDeclarationAccepted}
                onCheckedChange={setAdultDeclarationAccepted}
                required
              >
                Declaro que tenho 18 anos ou mais e que as informações
                fornecidas são verdadeiras.
              </ConsentCheckbox>

              <ConsentCheckbox
                id="terms-acceptance"
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
                required
              >
                Li e aceito os{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline decoration-gold underline-offset-2"
                >
                  Termos de Uso
                </Link>
                .
              </ConsentCheckbox>

              <ConsentCheckbox
                id="privacy-awareness"
                checked={privacyNoticeAcknowledged}
                onCheckedChange={setPrivacyNoticeAcknowledged}
                required
              >
                Li e estou ciente da{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline decoration-gold underline-offset-2"
                >
                  Política de Privacidade e Proteção de Dados
                </Link>
                .
              </ConsentCheckbox>

              <ConsentCheckbox
                id="marketing-consent"
                checked={marketingConsent}
                onCheckedChange={setMarketingConsent}
              >
                Desejo receber comunicações promocionais do SugarMimo.
                <span className="registration-helper mt-1 block">
                  Opcional. Você poderá alterar essa preferência depois.
                </span>
              </ConsentCheckbox>
            </fieldset>
          </section>
        </div>

        <div className="registration-legal-summary">
          <p>
            O SugarMimo é exclusivo para maiores de 18 anos e poderá solicitar
            validação de idade. A plataforma não permite atividades ilegais,
            exploração, comércio sexual ou condutas que coloquem pessoas em
            risco. Consulte os <Link href="/terms">Termos de Uso</Link> e a{" "}
            <Link href="/privacy">Política de Privacidade</Link>.
          </p>
        </div>

        <div className="registration-form-actions">
          <Button
            type="submit"
            disabled={
              !adultDeclarationAccepted ||
              !termsAccepted ||
              !privacyNoticeAcknowledged
            }
            className="registration-submit"
          >
            Continuar Cadastro
          </Button>
        </div>
      </form>
    </RegistrationFormShell>
  );
}

function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  required = false,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="registration-consent-row">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        required={required}
        className="mt-0.5 shrink-0"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm font-medium leading-relaxed text-[#d5ccbf]"
      >
        {children}
        {required ? <span className="sr-only"> Campo obrigatório.</span> : null}
      </label>
    </div>
  );
}
