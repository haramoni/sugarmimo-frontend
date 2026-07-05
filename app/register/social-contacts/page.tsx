"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  MessageCircle,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTER_PAYLOAD_KEY, setRegisterStep } from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";

export default function SocialContactsPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(() => getSavedValue("whatsapp"));
  const [telegram, setTelegram] = useState(() => getSavedValue("telegram"));
  const [instagram, setInstagram] = useState(() => getSavedValue("instagram"));

  useEffect(() => {
    const savedPayload = localStorage.getItem(REGISTER_PAYLOAD_KEY);

    if (!savedPayload) {
      router.replace("/register/basic-info");
      return;
    }

    if (
      !isSugarBabyProfile(JSON.parse(savedPayload) as Record<string, unknown>)
    ) {
      router.replace("/register/profile-photos");
      return;
    }

    setRegisterStep("/register/social-contacts");
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
        whatsapp: normalizeContact(whatsapp),
        telegram: normalizeUsername(telegram),
        instagram: normalizeUsername(instagram),
      }),
    );

    setRegisterStep("/register/profile-photos");
    router.push("/register/profile-photos");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-5 py-10 text-black-jewel">
      <section className="w-full max-w-140 bg-surface px-4 py-6 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <RegisterStepDots currentStep="/register/social-contacts" />

          <div>
            <h1 className="text-2xl font-bold text-black-jewel">
              Seus contatos
            </h1>
            <p className="text-sm text-[color-mix(in_srgb,var(--black)_64%,transparent)]">
              Informe os canais que a equipe pode usar para validar sua conta.
            </p>
          </div>

          <ContactField
            icon={MessageCircle}
            label="WhatsApp"
            value={whatsapp}
            onChange={setWhatsapp}
            placeholder="Ex.: 11999999999"
            type="tel"
            required
          />

          <ContactField
            icon={Send}
            label="Telegram"
            value={telegram}
            onChange={setTelegram}
            placeholder="Ex.: seuusuario"
          />

          <ContactField
            icon={AtSign}
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
            placeholder="Ex.: seuusuario"
            required
          />

          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/almost-there")}
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

type ContactFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
};

function ContactField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: ContactFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <div className="relative border-b border-silver bg-[color-mix(in_srgb,var(--gold-soft)_30%,white)]">
        <Icon className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
        <Input
          type={type}
          value={value}
          required={required}
          maxLength={80}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 border-0 bg-transparent pl-7 shadow-none focus-visible:ring-0"
        />
      </div>
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

function normalizeContact(value: string) {
  return value.trim().replace(/[^\d+]/g, "");
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

function isSugarBabyProfile(payload: Record<string, unknown>) {
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby");
}
