"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Frame,
  MessageCircle,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PREMIERE_PIX_KEY,
  PREMIERE_PIX_KEY_DISPLAY,
  premierePaymentWhatsappUrl,
} from "@/lib/contact";

import styles from "./PremiereOfferDialog.module.css";

export function PremiereOfferDialog({
  triggerVariant = "default",
}: {
  triggerVariant?: "default" | "navbar";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"benefits" | "payment">("benefits");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setStep("benefits");
      setCopyStatus("idle");
    }
  }

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(PREMIERE_PIX_KEY);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          aria-label="Seja Premiere"
          className={
            triggerVariant === "navbar"
              ? "h-10 shrink-0 rounded-full border border-[#d5b66f] bg-[linear-gradient(180deg,#fff8e8,#e8cc91)] px-3 text-xs font-extrabold text-[#5b4224] shadow-[0_8px_20px_rgba(205,167,94,0.22)] hover:bg-[linear-gradient(180deg,#fffdf7,#efdba9)] hover:text-[#3f2d19] sm:px-4"
              : "h-auto min-h-14 w-full rounded-full border border-[#e5cc96] bg-[linear-gradient(180deg,#fff8e8,#e8cc91)] px-4 py-2 font-bold text-[#5b4224] shadow-[0_12px_26px_rgba(205,167,94,0.24)] hover:bg-[linear-gradient(180deg,#fffdf7,#efdba9)] hover:text-[#3f2d19]"
          }
        >
          <Sparkles className="h-4 w-4 shrink-0 text-[#a87937]" />
          <span
            className={
              triggerVariant === "navbar"
                ? "whitespace-nowrap"
                : "grid text-center leading-tight"
            }
          >
            <span
              className={
                triggerVariant === "navbar"
                  ? "text-xs font-extrabold sm:text-sm"
                  : "text-sm font-extrabold sm:text-base"
              }
            >
              SEJA PREMIERE
            </span>
            {triggerVariant === "default" ? (
              <span className="text-[10px] font-bold tracking-[0.14em] text-[#7a5b32] sm:text-[11px]">
                (VAGAS LIMITADAS)
              </span>
            ) : null}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${styles.content} max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl`}
      >
        <div className={styles.panel}>
          <div className={styles.crown} aria-hidden="true">
            <Crown />
          </div>

          {step === "benefits" ? (
            <>
              <DialogHeader className="mt-4 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9b7138]">
                  Vagas limitadas
                </p>
                <DialogTitle className="font-serif text-3xl font-semibold leading-tight text-[#2d241a] sm:text-4xl">
                  Seja Premiere
                </DialogTitle>
                <DialogDescription className="mx-auto max-w-lg text-sm font-medium leading-6 text-[#5f503d] sm:text-base">
                  Ao se tornar Premiere, você está impulsionando o início da
                  SugarMimo e fazendo parte da nossa história desde o começo.
                </DialogDescription>
              </DialogHeader>

              <div className={styles.divider} aria-hidden="true">
                <span />
                <Sparkles className="h-4 w-4" />
                <span />
              </div>

              <div className="grid gap-3">
                <Benefit icon={Users}>
                  <strong>Acesso exclusivo inicial</strong> aos contatos das
                  meninas.
                </Benefit>
                <Benefit icon={Rocket}>
                  <strong>3 Boosts</strong> para usar futuramente e impulsionar
                  o seu perfil.
                </Benefit>
                <Benefit icon={Frame}>
                  <strong>Moldura exclusiva Premiere</strong> de forma
                  vitalícia.
                </Benefit>
              </div>

              <Button
                type="button"
                onClick={() => setStep("payment")}
                className="mt-5 h-12 w-full rounded-full border border-[#c7a263] bg-[linear-gradient(180deg,#3a2b20,#241a13)] font-extrabold text-[#efd79f] shadow-[0_12px_24px_rgba(54,37,22,0.18)] hover:bg-[#463326]"
              >
                Avançar para o pagamento
              </Button>
            </>
          ) : (
            <>
              <DialogHeader className="mt-4 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9b7138]">
                  Etapa final
                </p>
                <DialogTitle className="font-serif text-3xl font-semibold leading-tight text-[#2d241a] sm:text-4xl">
                  Pagamento via PIX
                </DialogTitle>
                <DialogDescription className="mx-auto max-w-lg text-sm font-medium leading-6 text-[#5f503d] sm:text-base">
                  Escaneie o QR Code ou copie a chave CNPJ, conclua o pagamento
                  no aplicativo do seu banco e envie o comprovante pelo
                  WhatsApp.
                </DialogDescription>
              </DialogHeader>

              <div className={styles.divider} aria-hidden="true">
                <span />
                <Sparkles className="h-4 w-4" />
                <span />
              </div>

              <div className={styles.pixCard}>
                <div className={styles.qrCodeWrap}>
                  {/* Static payment asset should be rendered without image optimization. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pix-premiere-qrcode.png"
                    alt="QR Code para pagamento PIX do Premiere"
                    className={styles.qrCode}
                  />
                </div>
                <p className="mt-3 text-center text-xs font-bold text-[#6d5738]">
                  Aponte a câmera do aplicativo do seu banco para o QR Code.
                </p>
                <div className={styles.pixSeparator} aria-hidden="true">
                  <span />
                  <small>ou copie a chave</small>
                  <span />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6b3d]">
                  Chave PIX — CNPJ
                </p>
                <p className={`${styles.pixKey} mt-2`}>
                  {PREMIERE_PIX_KEY_DISPLAY}
                </p>
                <Button
                  type="button"
                  onClick={() => void copyPixKey()}
                  className="mt-4 h-11 w-full rounded-full border border-[#d1b378] bg-[#f6e7c8] font-extrabold text-[#5b4224] hover:bg-[#eddbb5]"
                >
                  {copyStatus === "copied" ? (
                    <Check className="h-4 w-4 text-emerald" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copyStatus === "copied"
                    ? "Chave copiada!"
                    : "Copiar chave PIX"}
                </Button>
                {copyStatus === "error" ? (
                  <p className="mt-2 text-center text-xs font-bold text-ruby">
                    Não foi possível copiar automaticamente. Selecione a chave
                    acima e copie manualmente.
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-[auto_1fr]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("benefits")}
                  className="h-12 rounded-full border border-[#d8bf8c] px-5 font-bold text-[#745630] hover:bg-[#f1dfba]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  asChild
                  className="h-12 rounded-full bg-emerald px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(0,108,88,0.2)] hover:bg-emerald/85"
                >
                  <a
                    href={premierePaymentWhatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar confirmação no WhatsApp
                  </a>
                </Button>
              </div>
            </>
          )}

          <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
            <span
              className={`h-1.5 rounded-full transition-all ${
                step === "benefits" ? "w-7 bg-[#a87937]" : "w-1.5 bg-[#d7bd89]"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                step === "payment" ? "w-7 bg-[#a87937]" : "w-1.5 bg-[#d7bd89]"
              }`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Benefit({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.benefit}>
      <span className={styles.benefitIcon} aria-hidden="true">
        <Icon />
      </span>
      <p className="pt-1 text-sm font-medium leading-5 sm:text-[15px]">
        {children}
      </p>
    </div>
  );
}
