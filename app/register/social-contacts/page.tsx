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
import { RegistrationFormShell } from "../RegistrationFormShell";
import { useRegistrationSecret } from "../RegistrationSecretProvider";
import { FormFieldMessage, FormProgress, focusFormField } from "../../components/FormFeedback";
import { getPhoneError } from "../../lib/form-validation";

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
  const { password } = useRegistrationSecret();
  const [whatsapp, setWhatsapp] = useState(() => getSavedValue("whatsapp"));
  const [telegram, setTelegram] = useState(() => getSavedValue("telegram"));
  const [instagram, setInstagram] = useState(() => getSavedValue("instagram"));
  const [visibleContacts, setVisibleContacts] = useState<ContactChannel[]>(
    getSavedVisibleContacts,
  );
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(true);
  const issues = [
    { id: "whatsapp", label: "Celular/WhatsApp", message: getPhoneError(whatsapp) },
    { id: "telegram", label: "Telegram", message: telegram.trim() && !/^@?[A-Za-z0-9_]+$/.test(telegram.trim()) ? "Informe apenas o usuário do Telegram, sem espaços ou links." : undefined },
    { id: "instagram", label: "Instagram", message: instagram.trim() && !/^@?[A-Za-z0-9._]+$/.test(instagram.trim()) ? "Informe apenas o usuário do Instagram, sem espaços ou links." : undefined },
  ];
  const firstIssue = issues.find((issue) => issue.message);

  useEffect(() => {
    const savedPayload = localStorage.getItem(REGISTER_PAYLOAD_KEY);

    if (!savedPayload || !password) {
      setRegisterStep("/register/basic-info");
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
  }, [password, router]);

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
    if (firstIssue) { focusFormField(firstIssue.id); return; }

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
          className="registration-dialog registration-privacy-dialog"
        >
          <DialogHeader className="items-center text-center">
            <span className="registration-dialog-icon mb-2 grid h-14 w-14 place-items-center rounded-full">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <DialogTitle className="registration-privacy-title font-serif">
              Contatos para exibição
            </DialogTitle>
            <DialogDescription className="registration-privacy-description max-w-md">
              Estes contatos são separados do celular privado informado na
              criação da conta. Eles só serão mostrados a um Sugar Daddy
              autorizado se você decidir liberar cada canal.
            </DialogDescription>
          </DialogHeader>

          <div className="registration-dialog-note flex items-start gap-3 p-3 text-sm font-semibold leading-5">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p>Você mantém o controle e pode deixar todos os canais ocultos.</p>
          </div>

          <DialogFooter className="registration-privacy-actions">
            <DialogClose asChild>
              <Button className="registration-submit">
                Entendi, continuar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RegistrationFormShell
        currentStep="/register/social-contacts"
        eyebrow="Etapa 5 de 6 · Contatos"
        title="Contatos para exibição"
        description="Você decide quais canais poderão aparecer para usuários autorizados. O celular da conta continua privado."
        icon={MessageCircle}
        onBack={() => router.push("/register/almost-there")}
        backLabel="Voltar para preferências"
        size="standard"
      >
        <form className="registration-standard-form" onSubmit={handleSubmit} noValidate>
          <div className="registration-section-heading">
            <span>05</span>
            <div>
              <h2>Canais de contato</h2>
              <p>Preencha somente os canais que deseja manter no perfil.</p>
            </div>
          </div>

          <div className="registration-form-grid registration-contact-grid">
            <ContactField
              id="whatsapp"
              message={issues[0].message || undefined}
              icon={MessageCircle}
              label="Celular/WhatsApp para contato"
              description="Este número só poderá ser exibido se você liberar o canal WhatsApp abaixo."
              value={whatsapp}
              onChange={(value) => updateContact("whatsapp", value)}
              placeholder="Ex.: 11999999999"
              type="tel"
              required
            />

            <ContactField
              id="telegram"
              message={issues[1].message || undefined}
              icon={Send}
              label="Telegram (opcional)"
              value={telegram}
              onChange={(value) => updateContact("telegram", value)}
              placeholder="Ex.: seuusuario"
            />

            <ContactField
              id="instagram"
              message={issues[2].message || undefined}
              icon={AtSign}
              label="Instagram (opcional)"
              value={instagram}
              onChange={(value) => updateContact("instagram", value)}
              placeholder="Ex.: seuusuario"
            />
          </div>

          <div className="registration-visibility-panel">
            <div>
              <Label className="registration-label">
                Quais contatos deseja liberar?
              </Label>
              <p className="registration-helper mt-1">
                Cada escolha é independente e opcional. Todos começam privados;
                selecione somente os canais que deseja tornar visíveis para
                usuários autorizados.
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
                      "registration-contact-option",
                      selected ? "is-selected" : "",
                      hasValue
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-45",
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

          <FormProgress issues={issues} />
          <div className="registration-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/register/almost-there")}
              className="registration-secondary-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            <Button type="submit" disabled={Boolean(firstIssue)} className="registration-submit">
              Salvar e Continuar
            </Button>
          </div>
        </form>
      </RegistrationFormShell>
    </>
  );
}

type ContactFieldProps = {
  id: string;
  message?: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
};

function ContactField({
  id,
  message,
  icon: Icon,
  label,
  description,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: ContactFieldProps) {
  return (
    <div className="registration-field">
      <Label htmlFor={id} className="registration-label">{label}</Label>
      {description ? (
        <p className="registration-helper">{description}</p>
      ) : null}
      <div className="registration-control">
        <Icon className="registration-control-icon" />
        <Input
          id={id}
          name={id}
          autoComplete={type === "tel" ? "tel" : "off"}
          inputMode={type === "tel" ? "tel" : "text"}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(message)}
          aria-describedby={message ? `${id}-message` : undefined}
          type={type}
          value={value}
          required={required}
          maxLength={80}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="registration-input pl-10"
        />
      </div>
      <FormFieldMessage id={id} message={message} />
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
