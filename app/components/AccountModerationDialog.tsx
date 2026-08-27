"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  LoaderCircle,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

import type { ModerationNotice } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AccountModerationDialogProps = {
  notice: ModerationNotice | null;
  open: boolean;
  blocked?: boolean;
  onConfirm: () => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
};

const actionContent: Record<
  string,
  { label: string; title: string; description: string }
> = {
  WARNED: {
    label: "Advertência",
    title: "Você recebeu uma advertência",
    description:
      "Sua conta continua ativa, mas esta decisão foi registrada pela equipe de moderação.",
  },
  SUSPENDED: {
    label: "Suspensão temporária",
    title: "Sua conta está temporariamente suspensa",
    description:
      "Durante o período informado, o acesso e algumas funcionalidades ficam indisponíveis.",
  },
  BANNED: {
    label: "Conta bloqueada",
    title: "Sua conta foi bloqueada",
    description:
      "O acesso foi restringido após uma decisão da equipe de moderação.",
  },
  PROFILE_REJECTED: {
    label: "Cadastro não aprovado",
    title: "Seu cadastro não foi aprovado",
    description:
      "A equipe concluiu a análise do perfil e registrou a justificativa abaixo.",
  },
  CONTENT_REMOVED: {
    label: "Conteúdo removido",
    title: "Um conteúdo do seu perfil foi removido",
    description:
      "A conta permanece acessível, mas uma medida de moderação foi aplicada ao conteúdo.",
  },
  PHOTO_REJECTED: {
    label: "Foto não aprovada",
    title: "Uma foto enviada não foi aprovada",
    description:
      "A imagem continua indisponível para outras pessoas. Veja abaixo o motivo registrado pela equipe de moderação.",
  },
};

export function AccountModerationDialog({
  notice,
  open,
  blocked = false,
  onConfirm,
  onLogout,
}: AccountModerationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!notice) {
    return null;
  }

  const content = actionContent[notice.action] ?? {
    label: "Medida de moderação",
    title: "Sua conta recebeu uma medida de moderação",
    description:
      "A equipe de moderação registrou uma decisão relacionada à sua conta.",
  };

  async function confirm() {
    if (isConfirming) {
      return;
    }

    setError("");
    setIsConfirming(true);
    try {
      await onConfirm();
    } catch (confirmationError) {
      setError(
        confirmationError instanceof Error
          ? confirmationError.message
          : "Não foi possível confirmar a leitura.",
      );
      setIsConfirming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-1rem)] gap-0 overflow-y-auto rounded-2xl bg-[#fffdf9] p-0 sm:max-w-xl"
      >
        <DialogHeader className="border-b border-ruby/15 bg-linear-to-br from-ruby/12 via-[#fff8f5] to-gold/10 px-5 py-6 text-left sm:px-7">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ruby text-white shadow-sm">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-ruby/20 bg-white/75 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-ruby">
                {content.label}
              </span>
              <DialogTitle className="mt-3 font-serif text-2xl font-semibold leading-tight text-espresso">
                {content.title}
              </DialogTitle>
              <DialogDescription className="mt-2 leading-6 text-black-jewel/65">
                {content.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5 sm:px-7">
          <section
            className="rounded-xl border border-ruby/15 bg-ruby/[0.045] p-4"
            aria-labelledby="moderation-reason-title"
          >
            <p
              id="moderation-reason-title"
              className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ruby"
            >
              <FileWarning className="size-4" aria-hidden="true" />
              Motivo informado pela moderação
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-black-jewel/80">
              {notice.reason}
            </p>
          </section>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {notice.appliedAt ? (
              <div className="flex items-start gap-3 rounded-xl border border-black/8 p-3">
                <CalendarClock
                  className="mt-0.5 size-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                <span>
                  <strong className="block text-xs uppercase tracking-wide text-black-jewel/45">
                    Medida aplicada em
                  </strong>
                  {formatDateTime(notice.appliedAt)}
                </span>
              </div>
            ) : null}
            {notice.suspendedUntil ? (
              <div className="flex items-start gap-3 rounded-xl border border-black/8 p-3">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-ruby"
                  aria-hidden="true"
                />
                <span>
                  <strong className="block text-xs uppercase tracking-wide text-black-jewel/45">
                    Suspensão prevista até
                  </strong>
                  {formatDateTime(notice.suspendedUntil)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-emerald/8 p-4 text-sm leading-6 text-black-jewel/70">
            <Scale
              className="mt-0.5 size-5 shrink-0 text-emerald"
              aria-hidden="true"
            />
            <p>
              Se você discordar da decisão, pode solicitar uma revisão pelo
              atendimento. Informe seu usuário e, se exibido, o protocolo{" "}
              {notice.referenceId
                ? notice.referenceId.slice(0, 8).toUpperCase()
                : "da medida"}
              .
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-ruby/10 px-3 py-2 text-sm font-bold text-ruby"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gold/20 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {onLogout ? (
              <Button
                type="button"
                variant="ghost"
                disabled={isConfirming}
                onClick={() => void onLogout()}
                className="text-black-jewel/60"
              >
                Sair da conta
              </Button>
            ) : null}
            <Link
              href={notice.appealUrl || "/contato"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald/25 px-4 text-sm font-bold text-emerald transition hover:bg-emerald/8"
            >
              Solicitar revisão
            </Link>
          </div>
          <Button
            type="button"
            disabled={isConfirming}
            onClick={() => void confirm()}
            className="h-11 bg-ruby px-6 font-bold text-white hover:bg-ruby/85"
          >
            {isConfirming ? (
              <>
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Confirmando...
              </>
            ) : blocked ? (
              "Voltar ao login"
            ) : (
              "Li e estou ciente"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
