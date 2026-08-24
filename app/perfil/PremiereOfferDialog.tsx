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
import { useRef, useState } from "react";

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
  PREMIERE_ORIGINAL_PRICE_DISPLAY,
  PREMIERE_PIX_COPY_PASTE,
  PREMIERE_PIX_KEY_DISPLAY,
  PREMIERE_PRICE_DISPLAY,
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
  const contentRef = useRef<HTMLDivElement>(null);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setStep("benefits");
      setCopyStatus("idle");
    }
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(PREMIERE_PIX_COPY_PASTE);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  function showPayment() {
    setStep("payment");
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0 }));
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
                (OFERTA LIMITADA)
              </span>
            ) : null}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        ref={contentRef}
        className={`${styles.content} gap-0 p-0 sm:max-w-3xl`}
      >
        <div
          className={`${styles.panel} ${step === "payment" ? styles.paymentPanel : ""}`}
        >
          {step === "benefits" ? (
            <div className={styles.crown} aria-hidden="true">
              <Crown />
            </div>
          ) : null}

          {step === "benefits" ? (
            <>
              <DialogHeader className="mt-4 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9b7138]">
                  Oferta exclusiva · por pouco tempo
                </p>
                <DialogTitle className="font-serif text-3xl font-semibold leading-tight text-[#2d241a] sm:text-4xl">
                  Seja Premiere
                </DialogTitle>
                <DialogDescription className="mx-auto max-w-lg text-sm font-medium leading-6 text-[#5f503d] sm:text-base">
                  Garanta a moldura exclusiva Premiere para sempre e aproveite
                  todos os benefícios Premium por 1 mês.
                </DialogDescription>
              </DialogHeader>

              <div className={styles.divider} aria-hidden="true">
                <span />
                <Sparkles className="h-4 w-4" />
                <span />
              </div>

              <div className="grid gap-3">
                <Benefit icon={Users}>
                  <strong>1 mês de benefícios Premium</strong>, incluindo
                  acesso exclusivo aos contatos das meninas.
                </Benefit>
                <Benefit icon={Rocket}>
                  <strong>3 Boosts</strong> para usar futuramente e impulsionar
                  o seu perfil.
                </Benefit>
                <Benefit icon={Frame}>
                  <strong>Moldura exclusiva Premiere vitalícia</strong>, o
                  benefício adquirido com este pagamento único.
                </Benefit>
              </div>

              <div className="mt-3 rounded-xl border border-[#d8bf8c] bg-[#fff8e8]/80 px-4 py-3 text-center text-xs font-semibold leading-5 text-[#684e2c] sm:text-sm">
                Depois do mês incluído, para continuar Premium, será necessário
                se cadastrar e assinar o plano normalmente.
              </div>

              <PremierePrice />

              <Button
                type="button"
                onClick={showPayment}
                className="mt-5 h-12 w-full rounded-full border border-[#c7a263] bg-[linear-gradient(180deg,#3a2b20,#241a13)] font-extrabold text-[#efd79f] shadow-[0_12px_24px_rgba(54,37,22,0.18)] hover:bg-[#463326]"
              >
                Avançar para o pagamento
              </Button>
            </>
          ) : (
            <>
              <DialogHeader className={`${styles.paymentHeader} text-center`}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9b7138]">
                  Etapa final
                </p>
                <DialogTitle className="font-serif text-3xl font-semibold leading-tight text-[#2d241a] sm:text-4xl">
                  Pagamento via PIX
                </DialogTitle>
                <DialogDescription className="mx-auto max-w-lg text-sm font-medium leading-6 text-[#5f503d] sm:text-base">
                  O QR Code já está configurado com o valor de R$ 149,00.
                  Escaneie ou copie o código PIX, conclua no aplicativo do seu
                  banco e envie o comprovante pelo WhatsApp. Este é um
                  pagamento único e não uma assinatura recorrente.
                </DialogDescription>
              </DialogHeader>

              <div className={styles.divider} aria-hidden="true">
                <span />
                <Sparkles className="h-4 w-4" />
                <span />
              </div>

              <div className={styles.pixCard}>
                <PremierePrice compact />
                <div className={styles.pixPaymentGrid}>
                  <div className={styles.qrColumn}>
                    <div className={styles.qrCodeWrap}>
                      {/* Static payment asset should be rendered without image optimization. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/pix-premiere-14900-qrcode.png"
                        alt="QR Code PIX do Premiere no valor fixo de R$ 149,00"
                        className={styles.qrCode}
                      />
                    </div>
                    <p className={styles.qrHint}>
                      Aponte a câmera do banco e confira o valor de R$ 149,00
                      antes de pagar.
                    </p>
                  </div>
                  <div className={styles.pixDetails}>
                    <div className={styles.pixSeparator} aria-hidden="true">
                      <span />
                      <small>ou use o copia e cola</small>
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
                      onClick={() => void copyPixCode()}
                      className="mt-4 h-11 w-full rounded-full border border-[#d1b378] bg-[#f6e7c8] font-extrabold text-[#5b4224] hover:bg-[#eddbb5]"
                    >
                      {copyStatus === "copied" ? (
                        <Check className="h-4 w-4 text-emerald" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copyStatus === "copied"
                        ? "Código PIX copiado!"
                        : "Copiar código PIX"}
                    </Button>
                    {copyStatus === "error" ? (
                      <p className="mt-2 text-center text-xs font-bold text-ruby">
                        Não foi possível copiar automaticamente. Use o QR Code
                        ou a chave CNPJ acima.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[auto_1fr]">
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

          {step === "benefits" ? (
            <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-7 rounded-full bg-[#a87937]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7bd89]" />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PremierePrice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`${styles.priceOffer} ${compact ? styles.priceOfferCompact : ""}`}
      aria-label={`Oferta exclusiva Premiere por pouco tempo: de ${PREMIERE_ORIGINAL_PRICE_DISPLAY} por ${PREMIERE_PRICE_DISPLAY}, em pagamento único pela moldura vitalícia e 1 mês de benefícios Premium`}
    >
      <div className={styles.priceOfferTopline}>
        <span>Oferta exclusiva · 25% de desconto</span>
        <strong>Sai do ar em breve</strong>
      </div>
      <div className={styles.priceValues}>
        <span>
          De <del>{PREMIERE_ORIGINAL_PRICE_DISPLAY}</del>
        </span>
        <span className={styles.priceNow}>
          <small>Por</small>
          <strong>{PREMIERE_PRICE_DISPLAY}</strong>
        </span>
      </div>
      <p>Pagamento único · moldura vitalícia + 1 mês Premium</p>
    </div>
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
