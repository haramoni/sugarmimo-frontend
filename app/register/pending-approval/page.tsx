"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  LoaderCircle,
  LockKeyhole,
  MailCheck,
  QrCode,
  RefreshCw,
  Zap,
} from "lucide-react";

import { useAuth } from "@/app/components/AuthProvider";
import { removeAuthUser } from "@/app/lib/auth-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APPROVAL_PRIORITY_PRICE_DISPLAY } from "@/lib/contact";
import { clearRegisterFlow } from "../register-flow";
import { RegistrationFormShell } from "../RegistrationFormShell";

type PaymentState = {
  status: string;
  priorityActive?: boolean;
  amount?: number;
  dueDate?: string;
  paymentId?: string | null;
  qrCodeImage?: string;
  pixCopyPaste?: string;
  expirationDate?: string;
};

export default function PendingApprovalPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [fullName, setFullName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const loadPayment = useCallback(
    async (includeQr: boolean) => {
      const response = await fetch(
        `/api/payments/approval-priority?includeQr=${includeQr}`,
        { cache: "no-store" },
      ).catch(() => null);

      if (!response) {
        setError("Não foi possível consultar o pagamento agora.");
        return;
      }

      const result = (await response.json().catch(() => null)) as
        | PaymentState
        | { message?: string | string[] }
        | null;

      if (!response.ok) {
        setError(
          errorMessage(result, "Não foi possível consultar o pagamento."),
        );
        return;
      }

      const nextPayment = result as PaymentState;
      setPayment((current) => ({
        ...current,
        ...nextPayment,
        qrCodeImage: nextPayment.qrCodeImage ?? current?.qrCodeImage,
        pixCopyPaste: nextPayment.pixCopyPaste ?? current?.pixCopyPaste,
      }));

      if (nextPayment.priorityActive) {
        setError("");
        await refreshUser();
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPayment(true).finally(() => setIsLoadingPayment(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPayment]);

  const paymentStatus = payment?.status;

  useEffect(() => {
    if (!paymentStatus || !["PENDING", "CREATING"].includes(paymentStatus)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadPayment(false);
      }
    }, 5_000);

    return () => window.clearInterval(intervalId);
  }, [loadPayment, paymentStatus]);

  async function generatePix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopyStatus("idle");

    if (fullName.trim().length < 3) {
      setError("Informe seu nome completo.");
      return;
    }

    const documentDigits = cpfCnpj.replace(/\D/g, "");
    if (![11, 14].includes(documentDigits.length)) {
      setError("Informe um CPF ou CNPJ válido.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/payments/approval-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          cpfCnpj: documentDigits,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | PaymentState
        | { message?: string | string[] }
        | null;

      if (!response.ok) {
        throw new Error(errorMessage(result, "Não foi possível gerar o PIX."));
      }

      setPayment(result as PaymentState);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Não foi possível gerar o PIX.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyPixCode() {
    if (!payment?.pixCopyPaste) return;

    try {
      await navigator.clipboard.writeText(payment.pixCopyPaste);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  async function goToLogin() {
    setIsClearingSession(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    clearRegisterFlow();
    removeAuthUser();
    window.dispatchEvent(new Event("sugarmimo-auth"));
    router.replace("/login");
  }

  const paymentReceived =
    payment?.status === "RECEIVED" || payment?.priorityActive;
  const paymentPending = payment?.status === "PENDING";
  const canGenerate =
    !payment ||
    ["NOT_CREATED", "FAILED", "OVERDUE", "CANCELLED", "REFUNDED"].includes(
      payment.status,
    );

  return (
    <RegistrationFormShell
      eyebrow="Cadastro enviado"
      title="Cadastro recebido para análise!"
      description="Seu perfil ainda não está liberado. A equipe revisará suas informações e fotos, e o acesso será permitido somente depois da aprovação."
      icon={MailCheck}
      size="compact"
      aside={null}
    >
      <div className="registration-pending-content">
        <section className="registration-standard-review-card">
          <div className="registration-review-card-heading">
            <span className="registration-review-card-icon">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <span className="registration-review-free-badge">
                Fila normal · gratuita
              </span>
              <h2>Você já está na fila de análise</h2>
            </div>
          </div>
          <p>
            Não é necessário fazer nenhum pagamento. Você pode aguardar
            normalmente enquanto nossa equipe analisa o cadastro.
          </p>
          <p className="registration-manual-review-note">
            <strong>Análise 100% manual e sem prazo definido.</strong> Não há
            previsão exata para a aprovação, pois cada cadastro é revisado
            individualmente pela nossa equipe.
          </p>
          <div className="registration-review-access-note">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            <span>
              <strong>Acesso ao perfil:</strong> será liberado somente se o
              cadastro for aprovado.
            </span>
          </div>
        </section>

        <div className="registration-priority-divider">
          <span>Quer reduzir o tempo de espera?</span>
        </div>

        <div className="registration-priority-card">
          <div className="flex items-start gap-3">
            <span className="registration-priority-icon">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="registration-priority-label-row">
                <p>Análise rápida</p>
                <span>Opcional</span>
              </div>
              <h2 className="mt-1 text-base font-extrabold text-[#f4ecdf] sm:text-lg">
                Priorize sua análise por {APPROVAL_PRIORITY_PRICE_DISPLAY}
              </h2>
              <p className="mt-1.5 text-xs font-medium leading-5 text-[#aaa49b] sm:text-sm">
                Se preferir, pague via PIX para seu cadastro ser analisado com
                prioridade. Sem o pagamento, você continua normalmente na fila
                gratuita.
              </p>
            </div>
          </div>

          <div className="registration-priority-conditions">
            <span>
              <Check className="h-3.5 w-3.5" />
              Pagamento totalmente opcional
            </span>
            <span>
              <Clock className="h-3.5 w-3.5" />
              Prioriza somente a análise
            </span>
            <span>
              <LockKeyhole className="h-3.5 w-3.5" />
              Acesso somente após aprovação
            </span>
          </div>

          {isLoadingPayment ? (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gold/25 bg-white/75 p-3 text-sm font-bold text-black-jewel/65">
              <LoaderCircle className="h-5 w-5 animate-spin text-gold" />
              Consultando pagamento...
            </div>
          ) : null}

          {!isLoadingPayment && paymentReceived ? (
            <div className="mt-3 rounded-lg border border-emerald/30 bg-emerald/10 p-3 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald" />
              <p className="mt-2 text-base font-extrabold text-emerald sm:text-lg">
                Pagamento confirmado!
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-black-jewel/70">
                Seu perfil já está marcado para análise rápida. Não é necessário
                enviar comprovante. Aguarde a decisão da equipe para acessar o
                perfil.
              </p>
            </div>
          ) : null}

          {!isLoadingPayment && payment?.status === "CREATING" ? (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gold/25 bg-white/75 p-3 text-sm font-bold text-black-jewel/65">
              <LoaderCircle className="h-5 w-5 animate-spin text-gold" />
              Finalizando a geração da cobrança...
            </div>
          ) : null}

          {!isLoadingPayment && paymentPending ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-gold/30 bg-white p-3 text-center">
                {payment.qrCodeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeSource(payment.qrCodeImage)}
                    alt="QR Code PIX de R$ 30 para análise prioritária"
                    className="mx-auto h-36 w-36 sm:h-44 sm:w-44"
                  />
                ) : (
                  <QrCode className="mx-auto h-24 w-24 text-gold/45" />
                )}
                <p className="mt-3 text-sm font-extrabold text-black-jewel">
                  PIX de {APPROVAL_PRIORITY_PRICE_DISPLAY}
                </p>
                <p className="mt-1 text-xs font-semibold text-black-jewel/60">
                  Pague pelo aplicativo do seu banco. A confirmação é
                  automática.
                </p>
              </div>

              <Button
                type="button"
                disabled={!payment.pixCopyPaste}
                onClick={() => void copyPixCode()}
                className="h-10 w-full rounded-sm bg-emerald font-extrabold text-white hover:bg-emerald/85"
              >
                {copyStatus === "copied" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copyStatus === "copied"
                  ? "Código PIX copiado"
                  : "Copiar código PIX"}
              </Button>

              <p className="flex items-center justify-center gap-2 text-xs font-bold text-black-jewel/60">
                <RefreshCw className="h-3.5 w-3.5" />
                Aguardando confirmação do pagamento...
              </p>
            </div>
          ) : null}

          {!isLoadingPayment && canGenerate && !paymentReceived ? (
            <form onSubmit={generatePix} className="mt-3 space-y-3">
              <div className="registration-field">
                <Label
                  htmlFor="payment-full-name"
                  className="registration-label"
                >
                  Nome completo
                </Label>
                <div className="registration-control">
                  <Input
                    id="payment-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    maxLength={120}
                    placeholder="Seu nome completo"
                    disabled={isGenerating}
                    className="registration-input"
                  />
                </div>
              </div>
              <div className="registration-field">
                <Label
                  htmlFor="payment-document"
                  className="registration-label"
                >
                  CPF ou CNPJ
                </Label>
                <div className="registration-control">
                  <Input
                    id="payment-document"
                    value={cpfCnpj}
                    onChange={(event) =>
                      setCpfCnpj(formatCpfCnpj(event.target.value))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
                    placeholder="000.000.000-00"
                    disabled={isGenerating}
                    className="registration-input"
                  />
                </div>
                <p className="registration-helper">
                  O documento é enviado à Asaas para gerar a cobrança e não é
                  armazenado pela SugarMimo.
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="registration-submit h-11 w-full"
                >
                  {isGenerating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  {isGenerating
                    ? "Gerando PIX..."
                    : "Gerar PIX opcional de R$ 30"}
                </Button>
              </div>
            </form>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-md border border-ruby/25 bg-ruby/5 px-3 py-2 text-sm font-bold text-ruby">
              {error}
            </p>
          ) : null}

          {copyStatus === "error" ? (
            <p className="mt-3 text-xs font-bold text-ruby">
              Não foi possível copiar automaticamente. Use o QR Code ou tente
              novamente em outro navegador.
            </p>
          ) : null}

          <p className="mt-3 border-t border-gold/25 pt-2 text-xs font-semibold leading-5 text-black-jewel/65">
            <strong>Importante:</strong> o PIX antecipa apenas a análise. O
            pagamento não garante aprovação e não libera o acesso ao perfil.
            Todos seguem os mesmos critérios de segurança e verificação, e a
            análise rápida também não possui prazo garantido.
          </p>
        </div>

        <div className="registration-pending-login-action">
          <p>
            Você poderá entrar na conta depois que receber a aprovação do
            cadastro.
          </p>
          <Button
            type="button"
            disabled={isClearingSession}
            onClick={() => void goToLogin()}
            className="registration-submit h-11 w-full"
          >
            {isClearingSession
              ? "Limpando acesso..."
              : "Entendi, voltar ao login"}
          </Button>
        </div>
      </div>
    </RegistrationFormShell>
  );
}

function errorMessage(
  result: PaymentState | { message?: string | string[] } | null,
  fallback: string,
) {
  if (!result || !("message" in result)) return fallback;
  if (Array.isArray(result.message)) return result.message[0] ?? fallback;
  return result.message || fallback;
}

function qrCodeSource(encodedImage: string) {
  return encodedImage.startsWith("data:")
    ? encodedImage
    : `data:image/png;base64,${encodedImage}`;
}

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
