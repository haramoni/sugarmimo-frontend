"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Heart,
  HeartHandshake,
  Mars,
  Rainbow,
  Sparkles,
  Venus,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type ProfileIdentity = "man" | "woman" | "lgbtqia";

const IDENTITY_OPTIONS = [
  { value: "man", label: "Sou Homem", icon: Mars },
  { value: "woman", label: "Sou Mulher", icon: Venus },
  { value: "lgbtqia", label: "LGBTQIA+", icon: Rainbow },
] as const;

const PROFILE_OPTIONS: Record<
  ProfileIdentity,
  Array<{
    value: string;
    label: string;
    description: string;
    icon: typeof Heart;
  }>
> = {
  woman: [
    {
      value: "sugar-baby-woman",
      label: "Quero ser Sugar Baby",
      description: "Quero conhecer um Sugar Daddy ou uma Sugar Mommy.",
      icon: Heart,
    },
    {
      value: "sugar-mommy",
      label: "Quero ser Sugar Mommy",
      description: "Quero conhecer Sugar Babies.",
      icon: Crown,
    },
  ],
  man: [
    {
      value: "sugar-baby-man",
      label: "Quero ser Sugar Baby",
      description: "Quero conhecer um Sugar Daddy ou uma Sugar Mommy.",
      icon: Heart,
    },
    {
      value: "sugar-daddy",
      label: "Quero ser Sugar Daddy",
      description: "Quero conhecer Sugar Babies.",
      icon: Crown,
    },
  ],
  lgbtqia: [
    {
      value: "sugar-baby-lgbtqia",
      label: "Quero ser Sugar Baby",
      description: "Quero conhecer um Sugar Daddy ou uma Sugar Mommy.",
      icon: Heart,
    },
    {
      value: "sugar-provider-lgbtqia",
      label: "Quero ser Sugar Daddy / Mommy",
      description: "Quero conhecer Sugar Babies.",
      icon: Crown,
    },
  ],
};

export default function Register() {
  const router = useRouter();
  const { clearPassword } = useRegistrationSecret();
  const [identity, setIdentity] = useState<ProfileIdentity | null>(null);
  const [profileType, setProfileType] = useState("");
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

    if (!identity || !profileType) return;

    const formData = new FormData(event.currentTarget);
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

  function chooseIdentity(nextIdentity: ProfileIdentity) {
    setIdentity(nextIdentity);
    setProfileType("");
  }

  return (
    <RegistrationFormShell
      currentStep="/register"
      eyebrow="Etapa 1 de 6 · Perfil"
      title="Vamos começar por você"
      description="Primeiro, diga como você se identifica. Em seguida, escolha de forma simples como quer participar do SugarMimo."
      icon={Sparkles}
      onBack={() => router.push("/")}
      backLabel="Voltar para o início"
      size="wide"
    >
      <form className="registration-standard-form" onSubmit={handleSubmit}>
        <div className="registration-profile-setup-grid">
          <section className="registration-form-section registration-profile-section">
            <div className="registration-section-heading">
              <span>01</span>
              <div>
                <h2>Como você se identifica?</h2>
                <p>Escolha uma opção para personalizarmos o próximo passo.</p>
              </div>
            </div>

            <div className="registration-fields-stack">
              <fieldset className="registration-choice-fieldset">
                <legend className="sr-only">Como você se identifica?</legend>
                <div className="registration-identity-grid">
                  {IDENTITY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = identity === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => chooseIdentity(option.value)}
                        className={[
                          "registration-identity-option",
                          isSelected ? "is-selected" : "",
                        ].join(" ")}
                      >
                        <span className="registration-identity-icon">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {identity ? (
                <fieldset className="registration-choice-fieldset registration-reveal-section">
                  <legend className="registration-label">
                    Como você quer participar?
                  </legend>
                  <p className="registration-helper">
                    Escolha apenas uma opção. Isso define como seu perfil será
                    apresentado.
                  </p>
                  <div className="registration-profile-option-grid">
                    {PROFILE_OPTIONS[identity].map((option) => {
                      const Icon = option.icon;
                      const isSelected = profileType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setProfileType(option.value)}
                          className={[
                            "registration-profile-option",
                            isSelected ? "is-selected" : "",
                          ].join(" ")}
                        >
                          <span className="registration-profile-option-icon">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <strong>{option.label}</strong>
                            <small>{option.description}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <div className="registration-next-step-hint">
                  Selecione como você se identifica para ver as opções de
                  perfil.
                </div>
              )}

              {profileType ? (
                <div className="registration-reveal-section registration-fields-stack">
                  <div className="registration-field">
                    <label htmlFor="interest" className="registration-label">
                      Quero conhecer
                    </label>
                    <Select
                      name="interest"
                      defaultValue=""
                      required
                    >
                      <SelectTrigger
                        id="interest"
                        className="registration-select-trigger"
                      >
                        <SelectValue placeholder="Escolha uma preferência" />
                      </SelectTrigger>
                      <SelectContent className="premium-select-content registration-select-content">
                        <SelectItem value="women">Mulheres</SelectItem>
                        <SelectItem value="men">Homens</SelectItem>
                        <SelectItem value="both">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="registration-helper">
                      Essa preferência não altera o tipo do seu perfil.
                    </p>
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
              ) : null}
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
              !identity ||
              !profileType ||
              !adultDeclarationAccepted ||
              !termsAccepted ||
              !privacyNoticeAcknowledged
            }
            className="registration-submit"
          >
            Continuar cadastro
          </Button>
        </div>
        <p className="registration-login-note">
          Já possui uma conta? <Link href="/login">Acessar login</Link>
        </p>
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
