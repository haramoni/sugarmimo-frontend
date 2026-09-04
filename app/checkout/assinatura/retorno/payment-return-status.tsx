"use client";

import { Check, Clock3, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";

import styles from "../subscription-checkout.module.css";

type ReturnState = {
  status?: string;
  membershipActive?: boolean;
  membershipUntil?: string | null;
};

export function PaymentReturnStatus() {
  const { refreshUser } = useAuth();
  const [payment, setPayment] = useState<ReturnState | null>(null);
  const [failed, setFailed] = useState(false);

  const refreshPayment = useCallback(async () => {
    const response = await fetch("/api/payments/membership?includeQr=false", {
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) {
      setFailed(true);
      return;
    }
    const result = (await response.json()) as ReturnState;
    setPayment(result);
    setFailed(false);
    if (result.membershipActive) await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshPayment(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshPayment]);

  useEffect(() => {
    if (payment?.membershipActive) return;
    const intervalId = window.setInterval(() => void refreshPayment(), 4_000);
    return () => window.clearInterval(intervalId);
  }, [payment?.membershipActive, refreshPayment]);

  const terminalFailure = [
    "FAILED",
    "OVERDUE",
    "CANCELLED",
    "REFUNDED",
    "CHARGEBACK",
  ].includes(payment?.status ?? "");

  return (
    <section className={styles.returnShell}>
      <div className={styles.returnCard}>
        {payment?.membershipActive ? (
          <>
            <span className={styles.returnSuccessIcon}>
              <Check aria-hidden="true" />
            </span>
            <p>Pagamento confirmado</p>
            <h1>Sua assinatura está ativa</h1>
            <span>
              O novo destaque já foi aplicado ao seu perfil SugarMimo.
            </span>
            <Link href="/inicio" className={styles.returnButton}>
              Ir para o início
            </Link>
          </>
        ) : failed || terminalFailure ? (
          <>
            <span className={styles.returnErrorIcon}>
              <TriangleAlert aria-hidden="true" />
            </span>
            <p>Pagamento não concluído</p>
            <h1>Não foi possível ativar a assinatura</h1>
            <span>
              Volte aos planos para revisar a cobrança ou escolher novamente.
            </span>
            <Link href="/planos" className={styles.returnButton}>
              Voltar aos planos
            </Link>
          </>
        ) : (
          <>
            <span className={styles.returnPendingIcon}>
              {payment ? (
                <Clock3 aria-hidden="true" />
              ) : (
                <LoaderCircle className={styles.spinner} />
              )}
            </span>
            <p>Processando pagamento</p>
            <h1>Aguardando a confirmação</h1>
            <span>
              Isso costuma levar poucos segundos. A página será atualizada
              automaticamente.
            </span>
          </>
        )}
      </div>
    </section>
  );
}
