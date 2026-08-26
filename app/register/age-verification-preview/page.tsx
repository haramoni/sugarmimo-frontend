"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";

type PreviewState = "intro" | "provider" | "approved" | "review" | "rejected";

export default function AgeVerificationPreviewPage() {
  const [previewState, setPreviewState] = useState<PreviewState>("intro");

  return (
    <main className="min-h-screen bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
      <section className="flex min-h-screen items-center justify-center bg-[rgba(20,17,14,0.28)] px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] shadow-[0_28px_90px_rgba(20,17,14,0.32)] backdrop-blur-xl">
            <div className="h-1.5 bg-linear-to-r from-emerald via-gold to-ruby" />

            <header className="border-b border-silver/35 px-6 py-5 sm:px-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-cognac">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verificação 18+
                </span>
                <span className="rounded-full bg-espresso px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-white">
                  Protótipo
                </span>
              </div>
            </header>

            <div className="px-6 py-8 sm:px-9 sm:py-10">
              {previewState === "intro" ? (
                <IntroStep onContinue={() => setPreviewState("provider")} />
              ) : null}

              {previewState === "provider" ? (
                <ProviderPreview
                  onBack={() => setPreviewState("intro")}
                  onApproved={() => setPreviewState("approved")}
                  onReview={() => setPreviewState("review")}
                  onRejected={() => setPreviewState("rejected")}
                />
              ) : null}

              {previewState === "approved" ? (
                <ResultStep
                  icon={<CheckCircle2 className="h-9 w-9" />}
                  iconClassName="bg-emerald/12 text-emerald"
                  title="Idade confirmada"
                  description="O parceiro confirmou que você tem 18 anos ou mais. O SugarMimo receberia apenas esse resultado, sem cópia do documento."
                  actionLabel="Continuar cadastro"
                  actionClassName="bg-emerald hover:bg-emerald/85"
                  onAction={() => setPreviewState("intro")}
                />
              ) : null}

              {previewState === "review" ? (
                <ResultStep
                  icon={<Clock3 className="h-9 w-9" />}
                  iconClassName="bg-gold/15 text-cognac"
                  title="Verificação em análise"
                  description="O resultado não foi conclusivo. Em uma integração real, a pessoa poderia tentar novamente ou solicitar revisão manual."
                  actionLabel="Tentar novamente"
                  actionClassName="bg-cognac hover:bg-cognac/85"
                  onAction={() => setPreviewState("provider")}
                />
              ) : null}

              {previewState === "rejected" ? (
                <ResultStep
                  icon={<XCircle className="h-9 w-9" />}
                  iconClassName="bg-ruby/10 text-ruby"
                  title="Não foi possível confirmar 18+"
                  description="O cadastro ficaria pausado. A pessoa poderia corrigir o documento, tentar outro método ou solicitar revisão, sem criar um perfil ativo."
                  actionLabel="Revisar opções"
                  actionClassName="bg-ruby hover:bg-ruby/85"
                  onAction={() => setPreviewState("provider")}
                />
              ) : null}
            </div>

            <footer className="border-t border-silver/35 bg-white/45 px-6 py-4 text-center text-xs font-medium leading-relaxed text-black-jewel/58 sm:px-9">
              Esta demonstração não envia documentos, imagens ou dados pessoais.
            </footer>
          </div>

          <Link
            href="/register"
            className="mx-auto mt-5 flex w-fit items-center gap-2 text-sm font-bold text-white/90 transition hover:text-gold-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao cadastro atual
          </Link>
        </div>
      </section>
    </main>
  );
}

function IntroStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-emerald text-white shadow-[0_18px_42px_rgba(0,108,88,0.24)]">
        <ShieldCheck className="h-10 w-10" />
      </div>

      <div className="mx-auto mt-7 max-w-lg text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
          Comunidade somente para adultos
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-espresso sm:text-4xl">
          Confirme que você tem 18 anos ou mais
        </h1>
        <p className="mt-4 text-sm font-medium leading-6 text-black-jewel/65 sm:text-base">
          Antes de ativar seu perfil, um parceiro especializado confirmaria sua
          faixa etária de maneira segura e com o mínimo de dados possível.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <PrivacyCard
          icon={<ScanFace className="h-5 w-5" />}
          title="Verificação rápida"
          description="Estimativa facial ou documento, conforme o caso."
        />
        <PrivacyCard
          icon={<FileCheck2 className="h-5 w-5" />}
          title="Sem cópia no site"
          description="O documento não ficaria armazenado no SugarMimo."
        />
        <PrivacyCard
          icon={<LockKeyhole className="h-5 w-5" />}
          title="Resultado mínimo"
          description="Receberíamos somente a confirmação de maioridade."
        />
      </div>

      <Button
        type="button"
        onClick={onContinue}
        className="mt-8 h-12 w-full rounded-full bg-emerald text-base font-extrabold text-white shadow-[0_16px_34px_rgba(0,108,88,0.2)] hover:bg-emerald/85"
      >
        Ver demonstração
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="mt-4 text-center text-xs font-medium text-black-jewel/52">
        Em produção, o consentimento e a política do fornecedor seriam exibidos
        antes de iniciar.
      </p>
    </div>
  );
}

function ProviderPreview({
  onBack,
  onApproved,
  onReview,
  onRejected,
}: {
  onBack: () => void;
  onApproved: () => void;
  onReview: () => void;
  onRejected: () => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-cognac">
          <ScanFace className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
            Ambiente simulado do parceiro
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-espresso sm:text-3xl">
            Escolha um resultado para visualizar
          </h1>
          <p className="mt-2 text-sm leading-6 text-black-jewel/62">
            Nenhuma câmera será aberta e nenhum arquivo será solicitado nesta
            demonstração.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <ResultOption
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Simular aprovação 18+"
          description="Mostra como o cadastro continuaria após a confirmação."
          className="border-emerald/35 bg-emerald/5 text-emerald"
          onClick={onApproved}
        />
        <ResultOption
          icon={<Clock3 className="h-5 w-5" />}
          title="Simular revisão manual"
          description="Mostra o fluxo usado quando o resultado não é conclusivo."
          className="border-gold/45 bg-gold/5 text-cognac"
          onClick={onReview}
        />
        <ResultOption
          icon={<XCircle className="h-5 w-5" />}
          title="Simular não aprovação"
          description="Mostra como o perfil permanece bloqueado com opção de revisão."
          className="border-ruby/30 bg-ruby/5 text-ruby"
          onClick={onRejected}
        />
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-black-jewel/55 transition hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
    </div>
  );
}

function PrivacyCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-silver/45 bg-white/60 p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft/35 text-cognac">
        {icon}
      </span>
      <h2 className="mt-3 text-sm font-extrabold text-espresso">{title}</h2>
      <p className="mt-1 text-xs font-medium leading-5 text-black-jewel/58">
        {description}
      </p>
    </div>
  );
}

function ResultOption({
  icon,
  title,
  description,
  className,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/75">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold">{title}</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-black-jewel/58">
          {description}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </button>
  );
}

function ResultStep({
  icon,
  iconClassName,
  title,
  description,
  actionLabel,
  actionClassName,
  onAction,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  actionLabel: string;
  actionClassName: string;
  onAction: () => void;
}) {
  return (
    <div className="py-4 text-center">
      <span
        className={`mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] ${iconClassName}`}
      >
        {icon}
      </span>
      <h1 className="mt-6 font-heading text-3xl font-bold text-espresso">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-6 text-black-jewel/65 sm:text-base">
        {description}
      </p>
      <Button
        type="button"
        onClick={onAction}
        className={`mt-8 h-12 rounded-full px-7 font-extrabold text-white ${actionClassName}`}
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
      <button
        type="button"
        onClick={() => onAction()}
        className="mx-auto mt-4 flex items-center gap-2 text-xs font-bold text-black-jewel/50 transition hover:text-gold"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reiniciar demonstração
      </button>
    </div>
  );
}
