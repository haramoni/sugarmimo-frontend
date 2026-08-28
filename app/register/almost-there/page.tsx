"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
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
      <form className="registration-standard-form" onSubmit={handleSubmit}>
        <div className="registration-section-heading">
          <span>04</span>
          <div>
            <h2>Preferências e rotina</h2>
            <p>Responda somente o que se aplica ao seu momento atual.</p>
          </div>
        </div>

        <div className="registration-form-grid">
          <ProfileSelect
            label="Você fuma?"
            value={smoke}
            onValueChange={setSmoke}
            placeholder="Selecione uma opção"
            options={smokeOptions}
          />

          <ProfileSelect
            label="Você bebe?"
            value={drink}
            onValueChange={setDrink}
            placeholder="Selecione uma opção"
            options={drinkOptions}
          />

          <ProfileSelect
            label="Estado civil"
            value={relationship}
            onValueChange={setRelationship}
            placeholder="Selecione uma opção"
            options={optionsForProfile(relationshipOptions, profileType)}
          />

          <ProfileSelect
            label="Tem filhos?"
            value={children}
            onValueChange={setChildren}
            placeholder="Selecione uma opção"
            options={childrenOptions}
          />

          <ProfileSelect
            label="Escolaridade"
            value={education}
            onValueChange={setEducation}
            placeholder="Selecione uma opção"
            options={educationOptions}
          />

          <ProfileSelect
            label="Profissão (opcional)"
            value={occupation}
            onValueChange={setOccupation}
            placeholder="Selecione uma opção"
            options={optionsForProfile(occupationOptions, profileType)}
            required={false}
          />
        </div>

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
  required?: boolean;
};

function ProfileSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  required = true,
}: ProfileSelectProps) {
  return (
    <div className="registration-field">
      <Label className="registration-label">{label}</Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
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
  ) as Record<string, string | undefined>;

  return payload[field] ?? "";
}

function isSugarBabyProfile(payload: Record<string, unknown>) {
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby");
}
