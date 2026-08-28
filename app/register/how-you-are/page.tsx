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
      <form className="registration-standard-form" onSubmit={handleSubmit}>
        <div className="registration-section-heading">
          <span>03</span>
          <div>
            <h2>Características do perfil</h2>
            <p>Essas informações poderão ser atualizadas depois.</p>
          </div>
        </div>

        <div className="registration-form-grid">
          <ProfileSelect
            label="Tipo de corpo"
            value={bodyType}
            onValueChange={setBodyType}
            placeholder="Selecione uma opção"
            options={optionsForProfile(bodyTypes, profileType)}
          />

          <ProfileSelect
            label="Tom de pele"
            value={ethnicity}
            onValueChange={setEthnicity}
            placeholder="Selecione uma opção"
            options={optionsForProfile(ethnicities, profileType)}
          />

          <ProfileSelect
            label="Cabelo"
            value={hairColor}
            onValueChange={setHairColor}
            placeholder="Selecione uma opção"
            options={hairColors}
          />

          <ProfileSelect
            label="Cor dos olhos"
            value={eyeColor}
            onValueChange={setEyeColor}
            placeholder="Selecione uma opção"
            options={eyeColors}
          />

          <div className="registration-field registration-field-wide">
            <Label className="registration-label">Sua altura</Label>
            <Select value={heightCm} onValueChange={setHeightCm} required>
              <SelectTrigger className="registration-select-trigger">
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
          </div>
        </div>

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
              className="registration-submit"
            >
              Salvar e Continuar
            </Button>
          </div>
      </form>
    </RegistrationFormShell>
  );
}

type ProfileSelectProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
};

function ProfileSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: ProfileSelectProps) {
  return (
    <div className="registration-field">
      <Label className="registration-label">{label}</Label>
      <Select value={value} onValueChange={onValueChange} required>
        <SelectTrigger className="registration-select-trigger">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="registration-select-content">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
