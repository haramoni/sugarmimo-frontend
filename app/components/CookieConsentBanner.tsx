"use client";

import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { CONSENT_COOKIE, CONSENT_VERSION, CONSENT_EVENT, readConsent, subscribeToConsent } from "@/lib/cookie-consent";

const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

type ConsentChoice = "accepted" | "rejected";

function hasSavedChoice() {
  return readConsent() !== null;
}

function saveChoice(choice: ConsentChoice) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
    `${CONSENT_VERSION}.${choice}`,
  )}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;

  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: { choice } }),
  );
  if (choice === "rejected") void fetch("/api/metrics", { method: "DELETE" }).catch(() => undefined);
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const isVisible = useSyncExternalStore(
    subscribeToConsent,
    () => !hasSavedChoice(),
    () => false,
  );

  function handleChoice(choice: ConsentChoice) {
    saveChoice(choice);
    setEditing(false);
  }

  if (pathname === "/manutencao" || pathname.startsWith("/admin")) return null;
  if (!isVisible && !editing) {
    return pathname === "/privacy" ? (
      <button type="button" onClick={() => setEditing(true)} className="fixed bottom-4 left-4 z-[100] rounded-lg border border-gold/30 bg-white px-4 py-3 text-sm font-bold text-espresso shadow-lg">
        Preferências de cookies
      </button>
    ) : null;
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-6xl overflow-hidden rounded-2xl border border-gold/30 bg-[color-mix(in_srgb,var(--surface)_97%,transparent)] shadow-[0_24px_80px_rgba(20,17,14,0.28)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6"
    >
      <div className="h-1 bg-linear-to-r from-emerald via-gold to-cognac" />
      <div className="grid gap-5 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6">
        <div className="hidden h-13 w-13 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-cognac sm:grid">
          <Cookie aria-hidden="true" className="h-6 w-6" />
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald" />
            <h2
              id="cookie-consent-title"
              className="font-heading text-lg font-bold text-espresso sm:text-xl"
            >
              Sua privacidade importa
            </h2>
          </div>
          <p
            id="cookie-consent-description"
            className="max-w-3xl text-xs font-medium leading-5 text-black-jewel/68 sm:text-sm sm:leading-6"
          >
            Usamos cookies essenciais para autenticação e segurança. Com sua autorização,
            usamos cookies de análise para contar visitas e cliques nos principais links,
            sem registrar o conteúdo das conversas ou dos formulários. Você pode recusar
            ou mudar sua escolha na página de privacidade. Saiba mais na{" "}
            <Link
              href="/privacy#metricas"
              className="font-extrabold text-emerald underline decoration-emerald/35 underline-offset-3 transition hover:text-cognac"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-cognac/25 bg-white px-4 text-xs font-extrabold text-espresso transition hover:border-cognac/55 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cognac sm:px-5 sm:text-sm"
          >
            Recusar opcionais
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald bg-emerald px-4 text-xs font-extrabold text-white shadow-[0_8px_22px_rgba(0,108,88,0.2)] transition hover:border-[#005947] hover:bg-[#005947] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald sm:px-6 sm:text-sm"
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </section>
  );
}
