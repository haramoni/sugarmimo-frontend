"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  Check,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTER_PAYLOAD_KEY, setRegisterStep } from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";

type ContactChannel = "whatsapp" | "telegram" | "instagram";

const contactOptions: Array<{
  channel: ContactChannel;
  label: string;
  icon: LucideIcon;
}> = [
  { channel: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { channel: "telegram", label: "Telegram", icon: Send },
  { channel: "instagram", label: "Instagram", icon: AtSign },
];

export default function SocialContactsPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(() => getSavedValue("whatsapp"));
  const [telegram, setTelegram] = useState(() => getSavedValue("telegram"));
  const [instagram, setInstagram] = useState(() => getSavedValue("instagram"));
  const [visibleContacts, setVisibleContacts] = useState<ContactChannel[]>(
    getSavedVisibleContacts,
  );
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(true);

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

  const contactValues: Record<ContactChannel, string> = {
    whatsapp,
    telegram,
    instagram,
  };

  function updateContact(channel: ContactChannel, value: string) {
    if (channel === "whatsapp") {
      setWhatsapp(value);
    } else if (channel === "telegram") {
      setTelegram(value);
    } else {
      setInstagram(value);
    }

    if (!value.trim()) {
      setVisibleContacts((current) =>
        current.filter((item) => item !== channel),
      );
    }
  }

  function toggleContactVisibility(channel: ContactChannel) {
    setVisibleContacts((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

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
        visibleContactChannels: visibleContacts.filter((channel) =>
          Boolean(contactValues[channel].trim()),
        ),
      }),
    );

    setRegisterStep("/register/profile-photos");
    router.push("/register/profile-photos");
  }

  return (
    <>
      <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-lg gap-5 rounded-lg border border-emerald/22 bg-[color-mix(in_srgb,var(--surface)_96%,white)] p-6 shadow-[0_28px_80px_rgba(20,17,14,0.28)] sm:p-7"
        >
          <DialogHeader className="items-center text-center">
            <span className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald text-white shadow-[0_12px_28px_rgba(0,108,88,0.24)]">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <DialogTitle className="font-serif text-2xl font-bold text-black-jewel">
              Seus contatos são privados
            </DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6 text-black-jewel/68">
              WhatsApp, Instagram e Telegram não ficam públicos no seu perfil.
              Eles só serão mostrados a um Sugar Daddy autorizado se você
               decidir liberar cada canal.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-sm border border-gold/28 bg-[color-mix(in_srgb,var(--gold-soft)_22%,white)] p-3 text-sm font-semibold leading-5 text-black-jewel/72">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p>Você mantém o controle e pode deixar todos os canais ocultos.</p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-11 w-full rounded-sm bg-emerald font-bold text-white hover:bg-emerald/84">
                Entendi, continuar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            onChange={(value) => updateContact("whatsapp", value)}
            placeholder="Ex.: 11999999999"
            type="tel"
            required
          />

          <ContactField
            icon={Send}
            label="Telegram"
            value={telegram}
            onChange={(value) => updateContact("telegram", value)}
            placeholder="Ex.: seuusuario"
          />

          <ContactField
            icon={AtSign}
            label="Instagram"
            value={instagram}
            onChange={(value) => updateContact("instagram", value)}
            placeholder="Ex.: seuusuario"
            required
          />

          <div className="space-y-3 rounded-sm border border-emerald/22 bg-white/72 p-4">
            <div>
              <Label className="font-bold text-black-jewel">
                 Quais contatos deseja liberar?
              </Label>
              <p className="mt-1 text-xs font-medium leading-5 text-black-jewel/62">
                 Cada escolha é independente e opcional. Todos começam
                 privados; selecione somente os canais que deseja tornar
                 visíveis para usuários autorizados.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {contactOptions.map(({ channel, label, icon: Icon }) => {
                const hasValue = Boolean(contactValues[channel].trim());
                 const selected = visibleContacts.includes(channel);

                return (
                  <button
                    key={channel}
                    type="button"
                    disabled={!hasValue}
                    aria-pressed={selected}
                     onClick={() => toggleContactVisibility(channel)}
                    className={[
                      "flex min-h-20 items-center gap-2 rounded-sm border px-3 py-3 text-left text-sm font-bold transition",
                      selected
                        ? "border-emerald bg-emerald text-white shadow-[0_9px_22px_rgba(0,108,88,0.2)]"
                        : "border-emerald/22 bg-white text-black-jewel hover:border-emerald/48 hover:bg-emerald/6",
                      hasValue ? "cursor-pointer" : "cursor-not-allowed opacity-45",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

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
    </>
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

function getSavedVisibleContacts(): ContactChannel[] {
  if (typeof window === "undefined") {
    return [];
  }

  const payload = JSON.parse(
    window.localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
  ) as Record<string, unknown>;
  return Array.isArray(payload.visibleContactChannels)
    ? Array.from(
        new Set(payload.visibleContactChannels.filter(isContactChannel)),
      )
    : [];
}

function normalizeContact(value: string) {
  return value.trim().replace(/[^\d+]/g, "");
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

function isContactChannel(value: unknown): value is ContactChannel {
  return value === "whatsapp" || value === "telegram" || value === "instagram";
}

function isSugarBabyProfile(payload: Record<string, unknown>) {
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby");
}
