"use client";

import {
  ArrowLeft,
  Barcode,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/app/components/AuthProvider";

import styles from "./subscription-checkout.module.css";

type PaymentMethod = "credit-card" | "boleto" | "pix";
type PaymentState = {
  status: string;
  membershipActive?: boolean;
  plan?: string;
  cycle?: string;
  billingType?: "CREDIT_CARD" | "BOLETO" | "PIX";
  amount?: number;
  dueDate?: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  identificationField?: string | null;
  membershipUntil?: string | null;
  qrCodeImage?: string;
  pixCopyPaste?: string;
  expirationDate?: string;
};

const paymentMethods: Array<{
  id: PaymentMethod;
  name: string;
  description: string;
  detail: string;
  icon: typeof CreditCard;
}> = [
  {
    id: "credit-card",
    name: "Cartão de crédito",
    description: "Pagamento protegido e confirmação rápida.",
    detail: "Os dados do cartão serão informados no ambiente seguro do Asaas.",
    icon: CreditCard,
  },
  {
    id: "boleto",
    name: "Boleto bancário",
    description: "Pague pelo aplicativo ou banco de sua preferência.",
    detail: "A compensação pode levar até 3 dias úteis.",
    icon: Barcode,
  },
  {
    id: "pix",
    name: "Pix",
    description: "Aprovação instantânea, disponível 24 horas.",
    detail: "Use o QR Code ou o código copia e cola.",
    icon: QrCode,
  },
];

export function PaymentOptions({
  planId,
  cycleId,
  planName,
  cycle,
  total,
  monthlyEquivalent,
}: {
  planId: "member" | "premium" | "elite";
  cycleId: "monthly" | "quarterly" | "semiannual";
  planName: string;
  cycle: string;
  total: string;
  monthlyEquivalent: string;
}) {
  const { isAuthenticated, refreshUser } = useAuth();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [fullName, setFullName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const loadPayment = useCallback(
    async (includeQr: boolean) => {
      const response = await fetch(
        `/api/payments/membership?includeQr=${includeQr}`,
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
        if (response.status !== 401) setError(paymentErrorMessage(result));
        return;
      }

      const nextPayment = result as PaymentState;
      const belongsToSelection =
        !nextPayment.plan ||
        (nextPayment.plan === planId && nextPayment.cycle === cycleId);
      if (!belongsToSelection) return;

      setPayment((current) => ({
        ...current,
        ...nextPayment,
        qrCodeImage: nextPayment.qrCodeImage ?? current?.qrCodeImage,
        pixCopyPaste: nextPayment.pixCopyPaste ?? current?.pixCopyPaste,
      }));
      if (nextPayment.billingType) {
        setSelectedMethod(methodFromBillingType(nextPayment.billingType));
      }
      setError("");
      if (nextPayment.membershipActive) await refreshUser();
    },
    [cycleId, planId, refreshUser],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPayment(true).finally(() => setIsLoading(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPayment]);

  useEffect(() => {
    if (payment?.status !== "PENDING") return;
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadPayment(false);
    }, 5_000);
    return () => window.clearInterval(intervalId);
  }, [loadPayment, payment?.status]);

  async function createPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopyStatus("idle");

    if (!isAuthenticated) {
      setError("Entre na sua conta SugarMimo para gerar o pagamento.");
      return;
    }
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
      const response = await fetch("/api/payments/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          cpfCnpj: documentDigits,
          plan: planId,
          cycle: cycleId,
          method: selectedMethod,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | PaymentState
        | { message?: string | string[] }
        | null;
      if (!response.ok) throw new Error(paymentErrorMessage(result));

      const nextPayment = result as PaymentState;
      setPayment(nextPayment);
      if (
        nextPayment.billingType === "CREDIT_CARD" &&
        isTrustedAsaasUrl(nextPayment.invoiceUrl)
      ) {
        window.location.assign(nextPayment.invoiceUrl);
      }
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Não foi possível gerar o pagamento.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyPaymentCode(value?: string | null) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const paymentPending = payment?.status === "PENDING";
  const paymentReceived = Boolean(payment?.membershipActive);
  const paymentLocked = paymentPending || paymentReceived;

  return (
    <section className={styles.checkoutShell} aria-labelledby="checkout-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.checkoutHeader}>
        <Link href="/planos" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Alterar plano
        </Link>
        <p>Checkout SugarMimo</p>
        <h1 id="checkout-title">Finalize sua assinatura</h1>
        <span>
          Revise sua escolha e selecione como prefere realizar o pagamento.
        </span>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.paymentPanel}>
          <div className={styles.panelHeading}>
            <span>1</span>
            <div>
              <small>Forma de pagamento</small>
              <h2>Como você prefere pagar?</h2>
            </div>
          </div>

          <div className={styles.methodList} role="radiogroup">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={paymentLocked}
                  className={`${styles.methodCard} ${
                    isSelected ? styles.methodSelected : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className={styles.methodIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.methodCopy}>
                    <strong>{method.name}</strong>
                    <small>{method.description}</small>
                    <em>{method.detail}</em>
                  </span>
                  <span className={styles.radioMark} aria-hidden="true">
                    {isSelected ? <Check /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.integrationNotice}>
            <LockKeyhole aria-hidden="true" />
            <span>
              <strong>Pagamento protegido pelo Asaas</strong>
              A assinatura só é ativada após a confirmação financeira enviada
              ao SugarMimo.
            </span>
          </div>

          {error ? (
            <p className={styles.paymentError} role="alert">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className={styles.paymentLoading}>
              <LoaderCircle aria-hidden="true" /> Consultando pagamento...
            </div>
          ) : paymentReceived ? (
            <div className={styles.paymentSuccess}>
              <Check aria-hidden="true" />
              <div>
                <strong>Assinatura ativada!</strong>
                <span>
                  Seu plano {planName} já está disponível
                  {payment?.membershipUntil
                    ? ` até ${formatDate(payment.membershipUntil)}.`
                    : "."}
                </span>
              </div>
            </div>
          ) : paymentPending && payment?.billingType === "PIX" ? (
            <div className={styles.paymentResult}>
              <h3>Conclua o pagamento via Pix</h3>
              {payment.qrCodeImage ? (
                <div className={styles.pixGrid}>
                  <div className={styles.qrCodeWrap}>
                    {/* The authenticated Asaas API returns a trusted base64 PNG. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${payment.qrCodeImage}`}
                      alt={`QR Code Pix do plano ${planName}`}
                    />
                  </div>
                  <div>
                    <QrCode aria-hidden="true" />
                    <strong>Pix copia e cola</strong>
                    <button
                      type="button"
                      className={styles.copyButton}
                      disabled={!payment.pixCopyPaste}
                      onClick={() => void copyPaymentCode(payment.pixCopyPaste)}
                    >
                      {copyStatus === "copied" ? <Check /> : <Copy />}
                      {copyStatus === "copied"
                        ? "Código copiado!"
                        : "Copiar código Pix"}
                    </button>
                  </div>
                </div>
              ) : null}
              <p>Aguardando a confirmação automática do pagamento.</p>
            </div>
          ) : paymentPending && payment?.billingType === "BOLETO" ? (
            <div className={styles.paymentResult}>
              <h3>Seu boleto está pronto</h3>
              <p>Vencimento em {formatDate(payment.dueDate)}.</p>
              <div className={styles.boletoCode}>
                {payment.identificationField ?? "Linha digitável indisponível"}
              </div>
              <div className={styles.resultActions}>
                <button
                  type="button"
                  className={styles.copyButton}
                  disabled={!payment.identificationField}
                  onClick={() =>
                    void copyPaymentCode(payment.identificationField)
                  }
                >
                  {copyStatus === "copied" ? <Check /> : <Copy />}
                  {copyStatus === "copied"
                    ? "Linha copiada!"
                    : "Copiar linha digitável"}
                </button>
                {isTrustedAsaasUrl(payment.bankSlipUrl) ? (
                  <a
                    href={payment.bankSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.secondaryAction}
                  >
                    <ExternalLink /> Abrir boleto
                  </a>
                ) : null}
              </div>
            </div>
          ) : paymentPending && payment?.billingType === "CREDIT_CARD" ? (
            <div className={styles.paymentResult}>
              <h3>Pagamento com cartão</h3>
              <p>
                Informe os dados do cartão diretamente na página protegida do
                Asaas.
              </p>
              {isTrustedAsaasUrl(payment.invoiceUrl) ? (
                <a
                  href={payment.invoiceUrl}
                  className={styles.primaryPaymentAction}
                >
                  <CreditCard /> Continuar no Asaas <ExternalLink />
                </a>
              ) : null}
            </div>
          ) : (
            <form className={styles.payerForm} onSubmit={createPayment}>
              <div className={styles.formHeading}>
                <span>2</span>
                <div>
                  <small>Identificação do pagador</small>
                  <h3>Dados para gerar a cobrança</h3>
                </div>
              </div>
              <label>
                <span>Nome completo</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </label>
              <label>
                <span>CPF ou CNPJ</span>
                <input
                  value={cpfCnpj}
                  onChange={(event) => setCpfCnpj(event.target.value)}
                  inputMode="numeric"
                  placeholder="Somente números"
                  required
                />
              </label>
              <button
                type="submit"
                className={styles.generateButton}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <LoaderCircle className={styles.spinner} />
                ) : selectedMethod === "pix" ? (
                  <QrCode />
                ) : selectedMethod === "boleto" ? (
                  <Barcode />
                ) : (
                  <CreditCard />
                )}
                {isGenerating
                  ? "Gerando pagamento..."
                  : actionLabel(selectedMethod)}
              </button>
              {!isAuthenticated ? (
                <p className={styles.loginHint}>
                  Você precisa <Link href="/login">entrar na sua conta</Link>{" "}
                  para continuar.
                </p>
              ) : null}
            </form>
          )}
        </div>

        <aside className={styles.orderSummary} aria-label="Resumo do pedido">
          <p>Resumo da assinatura</p>
          <div className={styles.planBadge}>
            <span>SM</span>
            <div>
              <small>Plano selecionado</small>
              <strong>{planName}</strong>
            </div>
          </div>
          <dl>
            <div>
              <dt>Período</dt>
              <dd>{cycle}</dd>
            </div>
            <div>
              <dt>Equivalente</dt>
              <dd>{monthlyEquivalent}</dd>
            </div>
          </dl>
          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>
              <small>R$</small> {total}
            </strong>
          </div>
          <div className={styles.securitySeal}>
            <ShieldCheck aria-hidden="true" />
            <span>
              Cartão processado no Asaas. O SugarMimo não armazena os dados do
              seu cartão.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function actionLabel(method: PaymentMethod) {
  if (method === "pix") return "Gerar QR Code Pix";
  if (method === "boleto") return "Gerar boleto";
  return "Pagar com cartão";
}

function methodFromBillingType(type: NonNullable<PaymentState["billingType"]>) {
  if (type === "PIX") return "pix";
  if (type === "BOLETO") return "boleto";
  return "credit-card";
}

function paymentErrorMessage(result: unknown) {
  if (!result || typeof result !== "object") {
    return "Não foi possível gerar o pagamento.";
  }
  const message = (result as { message?: string | string[] }).message;
  return Array.isArray(message)
    ? (message[0] ?? "Não foi possível gerar o pagamento.")
    : (message ?? "Não foi possível gerar o pagamento.");
}

function isTrustedAsaasUrl(value?: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "asaas.com" || url.hostname.endsWith(".asaas.com"))
    );
  } catch {
    return false;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "data não informada";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00-03:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
