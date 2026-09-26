"use client";

import { Loader2, RefreshCwOff } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type RenewalState = {
  automaticRenewal?: boolean;
  canCancelAutomaticRenewal?: boolean;
  recurringStatus?: string | null;
};

export function MembershipRenewalControl({
  membershipUntil,
}: {
  membershipUntil: string;
}) {
  const [renewal, setRenewal] = useState<RenewalState | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/payments/membership?includeQr=false", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json().catch(() => null)) as RenewalState | null;
      })
      .then((result) => {
        if (result && !controller.signal.aborted) setRenewal(result);
      })
      .catch(() => null);
    return () => controller.abort();
  }, []);

  if (!renewal?.automaticRenewal) return null;

  async function cancelAutomaticRenewal() {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Cancelar renovação automática?",
      text: `Nenhuma nova cobrança será feita. Seu acesso atual continuará ativo até ${formatDate(membershipUntil)}.`,
      showCancelButton: true,
      confirmButtonText: "Cancelar renovação",
      cancelButtonText: "Manter renovação",
      confirmButtonColor: "#b42335",
    });
    if (!confirmation.isConfirmed) return;

    setIsCancelling(true);
    try {
      const response = await fetch("/api/payments/membership", {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível cancelar a renovação.",
        );
      }

      setRenewal({
        automaticRenewal: false,
        canCancelAutomaticRenewal: false,
        recurringStatus: "CANCELLED",
      });
      await Swal.fire({
        icon: "success",
        title: "Renovação cancelada",
        text:
          result?.message ??
          "Seu plano atual continuará disponível até o vencimento.",
        confirmButtonText: "Entendi",
        confirmButtonColor: "#006c58",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Não foi possível cancelar",
        text:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
        confirmButtonColor: "#006c58",
      });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="mt-3 border-t border-white/15 pt-3">
      <p className="text-xs font-bold text-white/80">
        Renovação automática ativa
      </p>
      <p className="mt-1 text-xs leading-5 text-white/60">
        O próximo período será cobrado automaticamente no cartão.
      </p>
      <button
        type="button"
        disabled={isCancelling || !renewal.canCancelAutomaticRenewal}
        onClick={() => void cancelAutomaticRenewal()}
        className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg border border-ruby/50 px-3 py-2 text-xs font-extrabold text-ruby-soft transition hover:bg-ruby/15 disabled:cursor-wait disabled:opacity-60"
      >
        {isCancelling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCwOff className="h-3.5 w-3.5" />
        )}
        {isCancelling ? "Cancelando..." : "Cancelar renovação automática"}
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
