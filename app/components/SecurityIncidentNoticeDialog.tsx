"use client";

import {
  CalendarClock,
  CheckCircle2,
  FileKey2,
  LifeBuoy,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import type { SecurityIncidentNotice } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SecurityIncidentNoticeDialogProps = {
  notice: SecurityIncidentNotice | null;
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onLogout: () => Promise<void> | void;
};

export function SecurityIncidentNoticeDialog({
  notice,
  open,
  onConfirm,
  onLogout,
}: SecurityIncidentNoticeDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!notice) {
    return null;
  }

  async function confirm() {
    if (isConfirming) return;

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
        className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] gap-0 overflow-y-auto rounded-2xl bg-[#fffdf9] p-0 sm:max-w-2xl"
      >
        <DialogHeader className="border-b border-ruby/15 bg-linear-to-br from-ruby/12 via-[#fff8f5] to-gold/10 px-5 py-6 text-left sm:px-7">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ruby text-white shadow-sm">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-ruby/20 bg-white/75 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-ruby">
                Comunicado de segurança
              </span>
              <DialogTitle className="mt-3 font-serif text-2xl font-semibold leading-tight text-espresso">
                Aviso importante sobre seus dados
              </DialogTitle>
              <DialogDescription className="mt-2 leading-6 text-black-jewel/65">
                Identificamos um incidente de segurança que envolveu dados
                vinculados à sua conta. As informações disponíveis estão
                reunidas abaixo de forma direta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5 sm:px-7">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoCard
              icon={CalendarClock}
              label="Data da ciência"
              value={formatDateTime(notice.controllerAwareAt)}
            />
            <InfoCard
              icon={FileKey2}
              label="Referência"
              value={notice.reference}
            />
          </div>

          <NoticeSection
            icon={TriangleAlert}
            title="O que ocorreu e quais dados foram envolvidos"
            value={notice.natureAndCategories}
            tone="warning"
          />
          <NoticeSection
            icon={ShieldAlert}
            title="Possíveis riscos e consequências"
            value={notice.likelyConsequences}
            tone="danger"
          />
          <NoticeSection
            icon={ShieldCheck}
            title="Medidas técnicas e de segurança adotadas"
            value={notice.securityMeasures}
            tone="safe"
          />
          <NoticeSection
            icon={CheckCircle2}
            title="O que estamos fazendo para reduzir os efeitos"
            value={notice.mitigationMeasures}
            tone="safe"
          />

          {notice.delayReason ? (
            <NoticeSection
              icon={CalendarClock}
              title="Motivo de eventual atraso na comunicação"
              value={notice.delayReason}
              tone="neutral"
            />
          ) : null}

          <div className="flex items-start gap-3 rounded-xl border border-emerald/15 bg-emerald/8 p-4 text-sm leading-6 text-black-jewel/75">
            <LifeBuoy
              className="mt-0.5 size-5 shrink-0 text-emerald"
              aria-hidden="true"
            />
            <p>
              Para esclarecimentos ou exercício de direitos, entre em contato
              pelo canal <strong>{notice.contactChannel}</strong> e informe a
              referência {notice.reference}.
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
          <Button
            type="button"
            variant="ghost"
            disabled={isConfirming}
            onClick={() => void onLogout()}
            className="text-black-jewel/60"
          >
            Sair da conta
          </Button>
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
            ) : (
              "Li e estou ciente"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/8 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
      <span>
        <strong className="block text-xs uppercase tracking-wide text-black-jewel/45">
          {label}
        </strong>
        {value}
      </span>
    </div>
  );
}

function NoticeSection({
  icon: Icon,
  title,
  value,
  tone,
}: {
  icon: typeof ShieldAlert;
  title: string;
  value: string | null;
  tone: "danger" | "warning" | "safe" | "neutral";
}) {
  const toneClasses = {
    danger: "border-ruby/15 bg-ruby/[0.045] text-ruby",
    warning: "border-gold/25 bg-gold/[0.07] text-gold",
    safe: "border-emerald/15 bg-emerald/[0.045] text-emerald",
    neutral: "border-black/10 bg-black/[0.025] text-black-jewel/55",
  }[tone];

  return (
    <section className={`rounded-xl border p-4 ${toneClasses}`}>
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-black-jewel/80">
        {value?.trim() || "Informação em apuração."}
      </p>
    </section>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
