"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export const LOGIN_PROMOTION_SESSION_KEY =
  "sugarmimo:launch-promotion-after-login";

type LoginPromotionDialogProps = {
  canOpen: boolean;
  userKey: string | null;
};

export function LoginPromotionDialog({
  canOpen,
  userKey,
}: LoginPromotionDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!canOpen || !userKey) return;

    let queuedForUser: string | null = null;

    try {
      queuedForUser = window.sessionStorage.getItem(
        LOGIN_PROMOTION_SESSION_KEY,
      );
    } catch {
      return;
    }

    if (queuedForUser !== userKey) return;

    const timeoutId = window.setTimeout(() => {
      setOpen(true);
      try {
        window.sessionStorage.removeItem(LOGIN_PROMOTION_SESSION_KEY);
      } catch {
        // The promotion can still be closed when session storage is unavailable.
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [canOpen, userKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[94dvh] w-[calc(100vw-1.5rem)] max-w-none gap-0 overflow-hidden rounded-2xl border border-luxury-gold/65 bg-[#090704] p-0 text-luxury-ivory shadow-[0_30px_100px_rgba(0,0,0,0.72),0_0_44px_rgba(213,166,78,0.2)] sm:w-[min(92vw,32rem)] sm:max-w-[32rem]">
        <DialogTitle className="sr-only">
          Promoção de lançamento SugarMimo
        </DialogTitle>
        <DialogDescription className="sr-only">
          Promoção de lançamento para Daddys: assinatura de um mês por R$
          129,90, com mensagens ilimitadas e acesso livre.
        </DialogDescription>
        <Link
          href="/planos"
          onClick={() => setOpen(false)}
          aria-label="Conhecer os planos e aproveitar a promoção de lançamento"
          className="flex max-h-[90dvh] justify-center focus-visible:outline-offset-[-4px] focus-visible:outline-luxury-champagne"
        >
          <Image
            src="/brand/promocao-daddy.png"
            alt="Promoção de lançamento SugarMimo para Daddys: assinatura de 1 mês por R$ 129,90"
            width={941}
            height={1672}
            sizes="(max-width: 640px) calc(100vw - 32px), 512px"
            priority
            className="h-auto max-h-[90dvh] w-auto max-w-full object-contain"
          />
        </Link>
      </DialogContent>
    </Dialog>
  );
}
