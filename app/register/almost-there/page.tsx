"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
import { RegisterStepDots } from "../RegisterStepDots";
import { useRegistrationCompletion } from "../profile-photos/useRegistrationCompletion";
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
  const completeRegistration = useRegistrationCompletion();
  const profileType = getSavedValue("profileType");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!localStorage.getItem(REGISTER_PAYLOAD_KEY)) {
      router.replace("/register/basic-info");
      return;
    }

    setRegisterStep("/register/almost-there");
  }, [router]);

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

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nextPayload,
          profilePhotos: [],
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível finalizar o cadastro.",
        );
      }

      await completeRegistration(result);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível finalizar o cadastro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-5 py-10 text-black-jewel">
      <section className="w-full max-w-140 bg-surface px-4 py-6 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <RegisterStepDots currentStep="/register/almost-there" />

          <div>
            <h1 className="text-2xl font-bold text-black-jewel">
              Preencha com suas preferências
            </h1>
          </div>

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

          {error && (
            <p className="rounded-sm bg-[color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-ruby">
              {error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/how-you-are")}
              className="h-12 rounded-sm border border-silver text-base font-bold text-black-jewel hover:bg-[color-mix(in_srgb,var(--silver)_28%,white)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-sm bg-emerald text-base font-bold text-white hover:bg-emerald/80 hover:text-surface"
            >
              {isSubmitting ? "Finalizando..." : "Salvar e Continuar"}
            </Button>
          </div>
        </form>
      </section>
    </main>
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
    <div className="space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger className="h-12 w-full rounded-none border-0 border-b border-silver bg-transparent px-0 shadow-none focus:ring-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
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
