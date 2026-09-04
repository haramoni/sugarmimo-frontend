"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Frame,
  LoaderCircle,
  QrCode,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/app/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PREMIERE_PRICE_DISPLAY,
} from "@/lib/contact";

import styles from "./PremiereOfferDialog.module.css";

type PremierePaymentState = {
  status: string;
  premiereActive?: boolean;
  premiumActive?: boolean;
  premiumUntil?: string | null;
  amount?: number;
  dueDate?: string;
  paymentId?: string | null;
  qrCodeImage?: string;
  pixCopyPaste?: string;
  expirationDate?: string;
};

export function PremiereOfferDialog({
  triggerVariant = "default",
  initialOpen = false,
  initialStep = "benefits",
}: {
  triggerVariant?: "default" | "navbar";
  initialOpen?: boolean;
  initialStep?: "benefits" | "payment";
}) {
  const { refreshUser, user } = useAuth();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [step, setStep] = useState<"benefits" | "payment">(initialStep);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [payment, setPayment] = useState<PremierePaymentState | null>(null);
  const [fullName, setFullName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  console.log("User type", user);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setStep("benefits");
      setCopyStatus("idle");
      setPaymentError("");
    }
  }

  const loadPayment = useCallback(
    async (includeQr: boolean) => {
      const response = await fetch(
        `/api/payments/premiere?includeQr=${includeQr}`,
        { cache: "no-store" },
      ).catch(() => null);

      if (!response) {
        setPaymentError("Não foi possível consultar o pagamento agora.");
        return;
      }

      const result = (await response.json().catch(() => null)) as
        | PremierePaymentState
        | { message?: string | string[] }
        | null;
      if (!response.ok) {
        setPaymentError(paymentErrorMessage(result));
        return;
      }

      const nextPayment = result as PremierePaymentState;
      setPayment((current) => ({
        ...current,
        ...nextPayment,
        qrCodeImage: nextPayment.qrCodeImage ?? current?.qrCodeImage,
        pixCopyPaste: nextPayment.pixCopyPaste ?? current?.pixCopyPaste,
      }));
      setPaymentError("");
      if (nextPayment.premiereActive) await refreshUser();
    },
    [refreshUser],
  );

  useEffect(() => {
    if (!isOpen || step !== "payment") return;
    const timeoutId = window.setTimeout(() => {
      void loadPayment(true).finally(() => setIsLoadingPayment(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, loadPayment, step]);

  useEffect(() => {
    if (
      !isOpen ||
      step !== "payment" ||
      !["PENDING", "CREATING"].includes(payment?.status ?? "")
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadPayment(false);
    }, 5_000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, loadPayment, payment?.status, step]);

  async function copyPixCode() {
    if (!payment?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(payment.pixCopyPaste);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  function showPayment() {
    setIsLoadingPayment(true);
    setStep("payment");
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0 }));
  }

  async function generatePix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError("");
    const documentDigits = cpfCnpj.replace(/\D/g, "");

    if (fullName.trim().length < 3) {
      setPaymentError("Informe seu nome completo.");
      return;
    }
    if (![11, 14].includes(documentDigits.length)) {
      setPaymentError("Informe um CPF ou CNPJ válido.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/payments/premiere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          cpfCnpj: documentDigits,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | PremierePaymentState
        | { message?: string | string[] }
        | null;
      if (!response.ok) throw new Error(paymentErrorMessage(result));
      setPayment(result as PremierePaymentState);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o PIX.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const paymentReceived =
    payment?.status === "RECEIVED" || payment?.premiereActive;
  const paymentPending = payment?.status === "PENDING";
  const canGenerate =
    !payment ||
    ["NOT_CREATED", "FAILED", "OVERDUE", "CANCELLED", "REFUNDED"].includes(
      payment.status,
    );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!user?.isPremiere && (
        <DialogTrigger asChild>
          <Button
            aria-label="Seja Premiere"
            className={
              triggerVariant === "navbar"
                ? "h-10 shrink-0 rounded-full border border-[#f3d58f] bg-[linear-gradient(180deg,#ffecb9_0%,#e6bd67_55%,#c98c2e_100%)] px-3 text-xs font-extrabold text-[#241509] shadow-[0_0_17px_rgba(225,189,138,0.55),0_8px_22px_rgba(84,55,19,0.34),inset_0_1px_0_rgba(255,250,229,0.78)] hover:bg-[linear-gradient(180deg,#fff3c9_0%,#edc978_55%,#d69a38_100%)] hover:text-[#1c1108] sm:px-4"
                : "h-auto min-h-14 w-full rounded-full border border-[#e5cc96] bg-[linear-gradient(180deg,#fff8e8,#e8cc91)] px-4 py-2 font-bold text-[#5b4224] shadow-[0_12px_26px_rgba(205,167,94,0.24)] hover:bg-[linear-gradient(180deg,#fffdf7,#efdba9)] hover:text-[#3f2d19]"
            }
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[#87571f]" />
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
      )}

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
                  <strong>1 mês de benefícios Premium!</strong>
                </Benefit>
                <Benefit icon={Rocket}>
                  <strong>3 Boosts</strong> para usar e impulsionar o seu
                  perfil.
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
                  Gere sua cobrança de R$ 149,00 e conclua o PIX. A confirmação
                  é automática: Premiere vitalício e Premium por um mês serão
                  ativados assim que o Asaas confirmar o recebimento.
                </DialogDescription>
              </DialogHeader>

              <div className={styles.divider} aria-hidden="true">
                <span />
                <Sparkles className="h-4 w-4" />
                <span />
              </div>

              {paymentError ? (
                <p className="rounded-xl border border-ruby/20 bg-ruby/10 px-4 py-3 text-center text-sm font-bold text-ruby">
                  {paymentError}
                </p>
              ) : null}

              {isLoadingPayment ? (
                <div className="grid min-h-48 place-items-center">
                  <LoaderCircle className="h-8 w-8 animate-spin text-[#a87937]" />
                </div>
              ) : paymentReceived ? (
                <div className="rounded-2xl border border-emerald/25 bg-emerald/10 px-5 py-8 text-center">
                  <Check className="mx-auto h-10 w-10 text-emerald" />
                  <h3 className="mt-3 text-xl font-extrabold text-emerald">
                    Premiere ativado!
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-[#5f503d]">
                    Sua moldura é vitalícia e o mês Premium já está valendo.
                  </p>
                </div>
              ) : paymentPending && payment.qrCodeImage ? (
                <div className={styles.pixCard}>
                  <PremierePrice compact />
                  <div className={styles.pixPaymentGrid}>
                    <div className={styles.qrColumn}>
                      <div className={styles.qrCodeWrap}>
                        {/* Asaas returns a trusted base64 PNG for this authenticated charge. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${payment.qrCodeImage}`}
                          alt="QR Code PIX do Premiere no valor de R$ 149,00"
                          className={styles.qrCode}
                        />
                      </div>
                      <p className={styles.qrHint}>
                        Aguardando a confirmação automática do pagamento.
                      </p>
                    </div>
                    <div className={styles.pixDetails}>
                      <QrCode className="mx-auto h-8 w-8 text-[#a87937]" />
                      <p className="mt-3 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6b3d]">
                        PIX copia e cola
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
                    </div>
                  </div>
                </div>
              ) : canGenerate ? (
                <form
                  onSubmit={generatePix}
                  className="mx-auto grid max-w-lg gap-4 rounded-2xl border border-[#d8bf8c] bg-white/70 p-5"
                >
                  <PremierePrice compact />
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="premiere-full-name">Nome completo</Label>
                    <Input
                      id="premiere-full-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="premiere-document">CPF ou CNPJ</Label>
                    <Input
                      id="premiere-document"
                      value={cpfCnpj}
                      onChange={(event) => setCpfCnpj(event.target.value)}
                      inputMode="numeric"
                      placeholder="Somente números"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="h-12 rounded-full bg-emerald font-extrabold text-white hover:bg-emerald/85"
                  >
                    {isGenerating ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                    {isGenerating ? "Gerando PIX..." : "Gerar PIX de R$ 149,00"}
                  </Button>
                </form>
              ) : null}

              <div className="mt-4 grid gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("benefits")}
                  className="h-12 rounded-full border border-[#d8bf8c] px-5 font-bold text-[#745630] hover:bg-[#f1dfba]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
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

function paymentErrorMessage(
  result: PremierePaymentState | { message?: string | string[] } | null,
) {
  if (!result || !("message" in result)) {
    return "Não foi possível gerar o PIX.";
  }
  return Array.isArray(result.message)
    ? (result.message[0] ?? "Não foi possível gerar o PIX.")
    : (result.message ?? "Não foi possível gerar o PIX.");
}
