"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGISTER_PAYLOAD_KEY, setRegisterStep } from "../register-flow";
import { RegistrationFormShell } from "../RegistrationFormShell";
import { useRegistrationSecret } from "../RegistrationSecretProvider";
import { RegistrationSelect } from "../RegistrationSelect";
import { FormFieldMessage, FormProgress, focusFormField } from "../../components/FormFeedback";
import {
  bodyTypes,
  describeForProfile,
  ethnicities,
  optionsForProfile,
} from "../../perfil/perfiloptions";

const hairColors = [
  "Preto",
  "Castanho",
  "Castanho claro",
  "Loiro",
  "Ruivo",
  "Vermelho",
  "Grisalho",
  "Calvo",
  "Outro",
];

const eyeColors = [
  "Castanho claro",
  "Castanho escuro",
  "Preto",
  "Azul",
  "Verde",
  "Cinza",
  "Outro",
];

const heights = Array.from({ length: 61 }, (_, index) => 150 + index);

export default function HowYouArePage() {
  const router = useRouter();
  const { password } = useRegistrationSecret();
  const profileType = getSavedValue("profileType");
  const [bodyType, setBodyType] = useState(() =>
    describeForProfile(getSavedValue("bodyType"), profileType),
  );
  const [ethnicity, setEthnicity] = useState(() =>
    describeForProfile(getSavedValue("ethnicity"), profileType),
  );
  const [hairColor, setHairColor] = useState(() => getSavedValue("hairColor"));
  const [eyeColor, setEyeColor] = useState(() => getSavedValue("eyeColor"));
  const [heightCm, setHeightCm] = useState(() => getSavedValue("heightCm"));
  const issues = [
    { id: "body-type", label: "Tipo de corpo", message: !bodyType ? "Selecione uma opção." : undefined },
    { id: "ethnicity", label: "Tom de pele", message: !ethnicity ? "Selecione uma opção." : undefined },
    { id: "hair-color", label: "Cabelo", message: !hairColor ? "Selecione uma opção." : undefined },
    { id: "eye-color", label: "Cor dos olhos", message: !eyeColor ? "Selecione uma opção." : undefined },
    { id: "height", label: "Altura", message: !heightCm ? "Selecione sua altura." : undefined },
  ];
  const firstIssue = issues.find((issue) => issue.message);

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_PAYLOAD_KEY) || !password) {
      setRegisterStep("/register/basic-info");
      router.replace("/register/basic-info");
      return;
    }

    setRegisterStep("/register/how-you-are");
  }, [password, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (firstIssue) { focusFormField(firstIssue.id); return; }

    const currentPayload = JSON.parse(
      localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );

    localStorage.setItem(
      REGISTER_PAYLOAD_KEY,
      JSON.stringify({
        ...currentPayload,
        bodyType,
        ethnicity,
        hairColor,
        eyeColor,
        heightCm: Number(heightCm),
      }),
    );

    setRegisterStep("/register/almost-there");
    router.push("/register/almost-there");
  }

  return (
    <RegistrationFormShell
      currentStep="/register/how-you-are"
      eyebrow="Etapa 3 de 6 · Aparência"
      title="Como você é?"
      description="Conte um pouco sobre suas características para deixar o perfil mais completo."
      icon={UserRound}
      onBack={() => router.push("/register/basic-info")}
      backLabel="Voltar para a conta"
      size="standard"
    >
      <form className="registration-standard-form" onSubmit={handleSubmit} noValidate>
        <div className="registration-section-heading">
          <span>03</span>
          <div>
            <h2>Características do perfil</h2>
            <p>Essas informações poderão ser atualizadas depois.</p>
          </div>
        </div>

        <div className="registration-form-grid">
          <RegistrationSelect
            id="body-type"
            label="Tipo de corpo"
            value={bodyType}
            onValueChange={setBodyType}
            placeholder="Selecione uma opção"
            options={optionsForProfile(bodyTypes, profileType)}
          />

          <RegistrationSelect
            id="ethnicity"
            label="Tom de pele"
            value={ethnicity}
            onValueChange={setEthnicity}
            placeholder="Selecione uma opção"
            options={optionsForProfile(ethnicities, profileType)}
          />

          <RegistrationSelect
            id="hair-color"
            label="Cabelo"
            value={hairColor}
            onValueChange={setHairColor}
            placeholder="Selecione uma opção"
            options={hairColors}
          />

          <RegistrationSelect
            id="eye-color"
            label="Cor dos olhos"
            value={eyeColor}
            onValueChange={setEyeColor}
            placeholder="Selecione uma opção"
            options={eyeColors}
          />

          <div className="registration-field registration-field-wide">
            <Label htmlFor="height" className="registration-label">Sua altura</Label>
            <Select value={heightCm} onValueChange={setHeightCm} required>
              <SelectTrigger id="height" className="registration-select-trigger" aria-invalid={!heightCm} aria-describedby={!heightCm ? "height-message" : undefined}>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="registration-select-content">
                {heights.map((height) => (
                  <SelectItem key={height} value={String(height)}>
                    {height} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldMessage id="height" message={issues[4].message} />
          </div>
        </div>

        <FormProgress issues={issues} />
        <div className="registration-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/basic-info")}
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
  ) as Record<string, string | number | undefined>;

  return payload[field] ? String(payload[field]) : "";
}
