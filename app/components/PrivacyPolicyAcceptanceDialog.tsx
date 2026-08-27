"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import policyPages from "@/app/privacy/policy-pages";
import {
  CURRENT_PRIVACY_POLICY_DATE,
  CURRENT_PRIVACY_POLICY_VERSION,
} from "@/app/privacy/privacy-policy";

type PrivacyPolicyAcceptanceDialogProps = {
  open: boolean;
  onAccept: () => Promise<void> | void;
  secondaryLabel?: string;
  onSecondary?: () => Promise<void> | void;
};

export function PrivacyPolicyAcceptanceDialog({
  open,
  onAccept,
  secondaryLabel,
  onSecondary,
}: PrivacyPolicyAcceptanceDialogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasReachedEnd(false);
      setProgress(0);
      setError("");

      const area = scrollAreaRef.current;

      if (area) {
        area.scrollTop = 0;
      }

      if (area && area.scrollHeight <= area.clientHeight + 8) {
        setHasReachedEnd(true);
        setProgress(100);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  function handleScroll() {
    const area = scrollAreaRef.current;

    if (!area) {
      return;
    }

    const maxScroll = Math.max(0, area.scrollHeight - area.clientHeight);
    const nextProgress =
      maxScroll === 0 ? 100 : Math.min(100, (area.scrollTop / maxScroll) * 100);

    setProgress(nextProgress);

    if (area.scrollTop >= maxScroll - 16) {
      setHasReachedEnd(true);
    }
  }

  async function handleAccept() {
    if (!hasReachedEnd || isAccepting) {
      return;
    }

    setError("");
    setIsAccepting(true);

    try {
      await onAccept();
    } catch (acceptanceError) {
      setError(
        acceptanceError instanceof Error
          ? acceptanceError.message
          : "Não foi possível registrar a ciência. Tente novamente.",
      );
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="h-[min(92dvh,900px)] max-w-[calc(100%-1rem)] grid-rows-[auto_4px_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl bg-[#fffdf9] p-0 sm:max-w-4xl"
      >
        <DialogHeader className="border-b border-gold/25 bg-linear-to-r from-[#f8eee0] via-[#fffaf2] to-[#f4e3e7] px-5 py-5 pr-6 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald text-white shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight text-espresso sm:text-2xl">
                Política de Privacidade e Proteção de Dados
              </DialogTitle>
              <DialogDescription className="mt-1 leading-relaxed text-black-jewel/65">
                Leia o documento integral até o final para liberar o botão de
                confirmação e continuar usando a SugarMimo.
              </DialogDescription>
              <p className="mt-2 text-xs font-bold tracking-wide text-cognac uppercase">
                Versão {CURRENT_PRIVACY_POLICY_VERSION} · Atualizada em{" "}
                {CURRENT_PRIVACY_POLICY_DATE}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="h-1 bg-black-jewel/10" aria-hidden="true">
          <div
            className="h-full bg-linear-to-r from-emerald via-gold to-ruby transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="min-h-0 overflow-y-auto overscroll-contain bg-[#f7f3ed] px-3 py-4 sm:px-6 sm:py-6"
          aria-label="Texto integral da Política de Privacidade"
          tabIndex={0}
        >
          <div className="mx-auto max-w-3xl space-y-4">
            {policyPages.map((pageText, index) => (
              <section
                key={index}
                className="relative rounded-xl border border-black/8 bg-white px-4 py-6 shadow-[0_8px_24px_rgba(36,27,19,0.06)] sm:px-7"
                aria-label={`Página ${index + 1} de ${policyPages.length}`}
              >
                <span className="absolute right-4 top-3 text-[0.65rem] font-extrabold tracking-widest text-black-jewel/35">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(policyPages.length).padStart(2, "0")}
                </span>
                <pre className="whitespace-pre-wrap pt-3 font-sans text-[0.78rem] leading-6 text-black-jewel/82 sm:text-sm">
                  {pageText}
                </pre>
              </section>
            ))}

            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald/25 bg-emerald/8 px-4 py-5 text-sm font-bold text-emerald">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              Você chegou ao final da Política de Privacidade.
            </div>
          </div>
        </div>

        <div className="border-t border-gold/25 bg-white px-4 py-4 sm:px-7">
          {!hasReachedEnd && (
            <p className="mb-3 flex items-center justify-center gap-2 text-center text-xs font-bold text-black-jewel/60">
              <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
              Continue rolando para ler todo o documento.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-ruby/10 px-3 py-2 text-center text-sm font-bold text-ruby"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {secondaryLabel && onSecondary ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void onSecondary()}
                disabled={isAccepting}
                className="text-black-jewel/65"
              >
                {secondaryLabel}
              </Button>
            ) : (
              <span />
            )}

            <Button
              type="button"
              onClick={() => void handleAccept()}
              disabled={!hasReachedEnd || isAccepting}
              className="h-11 bg-emerald px-6 font-bold text-white hover:bg-emerald/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isAccepting ? (
                <>
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Registrando...
                </>
              ) : (
                "Li e estou ciente da Política de Privacidade"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
