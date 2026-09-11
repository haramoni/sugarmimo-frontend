"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RegistrationSelect } from "../RegistrationSelect";
import { FormProgress, focusFormField } from "../../components/FormFeedback";
import {
  REGISTER_PAYLOAD_KEY,
  setRegisterStep,
} from "../register-flow";
import { RegistrationFormShell } from "../RegistrationFormShell";
import { useRegistrationSecret } from "../RegistrationSecretProvider";
import {
  describeForProfile,
  occupationOptions,
  optionsForProfile,
  relationshipOptions,
} from "../../perfil/perfiloptions";

const smokeOptions = [
  "Nunca",
  "Raramente",
  "Socialmente",
  "Frequentemente",
  "Muito frequentemente",
  "Tentando parar",
  "Parei",
];

const drinkOptions = [
  "Nunca",
  "Raramente",
  "Socialmente",
  "Regularmente",
  "Frequentemente",
  "Tentando parar",
  "Parei",
];

const childrenOptions = [
  "Nenhum",
  "1 Filho",
  "2 Filhos",
  "3 Filhos",
  "4 Filhos",
  "5 ou mais",
];

const educationOptions = [
  "2º Grau",
  "Técnico Profissionalizante",
  "Superior Cursando",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduado",
  "Ph.D. / Pós-graduado",
  "Escola da Vida!",
];

export default function AlmostTherePage() {
  const router = useRouter();
  const { password } = useRegistrationSecret();
  const profileType = getSavedValue("profileType");
  const [smoke, setSmoke] = useState(() => getSavedValue("smoke"));
  const [drink, setDrink] = useState(() => getSavedValue("drink"));
  const [relationship, setRelationship] = useState(() =>
    describeForProfile(getSavedValue("relationship"), profileType),
  );
  const [children, setChildren] = useState(() => getSavedValue("children"));
  const [education, setEducation] = useState(() => getSavedValue("education"));
  const [occupation, setOccupation] = useState(() =>
    describeForProfile(getSavedValue("occupation"), profileType),
  );
  const issues = [
    { id: "smoke", label: "Você fuma?", message: !smoke ? "Selecione uma opção." : undefined },
    { id: "drink", label: "Você bebe?", message: !drink ? "Selecione uma opção." : undefined },
    { id: "relationship", label: "Estado civil", message: !relationship ? "Selecione uma opção." : undefined },
    { id: "children", label: "Filhos", message: !children ? "Selecione uma opção." : undefined },
    { id: "education", label: "Escolaridade", message: !education ? "Selecione uma opção." : undefined },
  ];
  const firstIssue = issues.find((issue) => issue.message);

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_PAYLOAD_KEY) || !password) {
      setRegisterStep("/register/basic-info");
      router.replace("/register/basic-info");
      return;
    }

    setRegisterStep("/register/almost-there");
  }, [password, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (firstIssue) { focusFormField(firstIssue.id); return; }

    const currentPayload = JSON.parse(
      localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );

    const nextPayload = {
      ...currentPayload,
      smoke,
      drink,
      relationship,
      children,
      education,
      occupation,
    };

    localStorage.setItem(REGISTER_PAYLOAD_KEY, JSON.stringify(nextPayload));

    if (isSugarBabyProfile(nextPayload)) {
      const nextStep = "/register/social-contacts";
      setRegisterStep(nextStep);
      router.push(nextStep);
      return;
    }

    const nextStep = "/register/profile-photos";
    setRegisterStep(nextStep);
    router.push(nextStep);
  }

  return (
    <RegistrationFormShell
      currentStep="/register/almost-there"
      eyebrow="Etapa 4 de 6 · Preferências"
      title="Seu estilo de vida"
      description="Compartilhe suas preferências para encontrarmos conexões mais compatíveis com você."
      icon={SlidersHorizontal}
      onBack={() => router.push("/register/how-you-are")}
      backLabel="Voltar para aparência"
      size="standard"
    >
      <form className="registration-standard-form" onSubmit={handleSubmit} noValidate>
        <div className="registration-section-heading">
          <span>04</span>
          <div>
            <h2>Preferências e rotina</h2>
            <p>Responda somente o que se aplica ao seu momento atual.</p>
          </div>
        </div>

        <div className="registration-form-grid">
          <RegistrationSelect
            id="smoke"
            label="Você fuma?"
            value={smoke}
            onValueChange={setSmoke}
            placeholder="Selecione uma opção"
            options={smokeOptions}
          />

          <RegistrationSelect
            id="drink"
            label="Você bebe?"
            value={drink}
            onValueChange={setDrink}
            placeholder="Selecione uma opção"
            options={drinkOptions}
          />

          <RegistrationSelect
            id="relationship"
            label="Estado civil"
            value={relationship}
            onValueChange={setRelationship}
            placeholder="Selecione uma opção"
            options={optionsForProfile(relationshipOptions, profileType)}
          />

          <RegistrationSelect
            id="children"
            label="Tem filhos?"
            value={children}
            onValueChange={setChildren}
            placeholder="Selecione uma opção"
            options={childrenOptions}
          />

          <RegistrationSelect
            id="education"
            label="Escolaridade"
            value={education}
            onValueChange={setEducation}
            placeholder="Selecione uma opção"
            options={educationOptions}
          />

          <RegistrationSelect
            id="occupation"
            label="Profissão (opcional)"
            value={occupation}
            onValueChange={setOccupation}
            placeholder="Selecione uma opção"
            options={optionsForProfile(occupationOptions, profileType)}
            required={false}
          />
        </div>

        <FormProgress issues={issues} />
        <div className="registration-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/how-you-are")}
              className="registration-secondary-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              disabled={Boolean(firstIssue)}
              className="registration-submit"
            >
              Salvar e Continuar
            </Button>
          </div>
      </form>
    </RegistrationFormShell>
  );
}

function getSavedValue(field: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const payload = JSON.parse(
    window.localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
  ) as Record<string, string | undefined>;

  return payload[field] ?? "";
}

function isSugarBabyProfile(payload: Record<string, unknown>) {
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby");
}
