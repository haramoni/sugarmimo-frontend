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

const bodyTypes = [
  "Magra",
  "Medio",
  "Musculosa",
  "Em forma",
  "Um pouco acima do peso",
  "Grande e amorosa",
];

const ethnicities = [
  "Branca/Caucasiano",
  "Parda",
  "Negra/Afrodescendente",
  "Latina/Hispanico",
  "Asiatica japonesa",
  "Asiatica chinesa",
  "Asiatica coreana",
  "Asiatica outras",
  "Indiana",
  "Do Oriente Medio",
  "Outros",
];

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
  const [bodyType, setBodyType] = useState(() => getSavedValue("bodyType"));
  const [ethnicity, setEthnicity] = useState(() => getSavedValue("ethnicity"));
  const [hairColor, setHairColor] = useState(() => getSavedValue("hairColor"));
  const [eyeColor, setEyeColor] = useState(() => getSavedValue("eyeColor"));
  const [heightCm, setHeightCm] = useState(() => getSavedValue("heightCm"));

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_PAYLOAD_KEY)) {
      router.replace("/register/basic-info");
      return;
    }

    setRegisterStep("/register/how-you-are");
  }, [router]);

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
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-5 py-10 text-black-jewel">
      <section className="w-full max-w-140 bg-surface px-4 py-6 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <RegisterStepDots currentStep="/register/how-you-are" />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-black-jewel">
                Como você é?
              </h1>
            </div>
          </div>

          <ProfileSelect
            label="Tipo de corpo"
            value={bodyType}
            onValueChange={setBodyType}
            placeholder="Selecione uma opção"
            options={bodyTypes}
          />

          <ProfileSelect
            label="Tom de pele"
            value={ethnicity}
            onValueChange={setEthnicity}
            placeholder="Selecione uma opção"
            options={ethnicities}
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

          <div className="space-y-2">
            <Label className="font-bold text-black-jewel">Sua altura</Label>
            <Select value={heightCm} onValueChange={setHeightCm} required>
              <SelectTrigger className="h-12 w-full rounded-none border-0 border-b border-silver bg-transparent px-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {heights.map((height) => (
                  <SelectItem key={height} value={String(height)}>
                    {height} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/basic-info")}
              className="h-12 rounded-sm border border-silver text-base font-bold text-black-jewel hover:bg-[color-mix(in_srgb,var(--silver)_28%,white)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="submit"
              className="h-12 rounded-sm bg-emerald text-base font-bold text-white hover:bg-emerald/80 hover:text-surface"
            >
              Salvar e Continuar
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
};

function ProfileSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: ProfileSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <Select value={value} onValueChange={onValueChange} required>
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
  ) as Record<string, string | number | undefined>;

  return payload[field] ? String(payload[field]) : "";
}
