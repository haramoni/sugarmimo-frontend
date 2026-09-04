"use client";

import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/app/components/ui/Navbar";
import { PremiereOfferDialog } from "@/app/perfil/PremiereOfferDialog";

export default function PremiereCheckoutPage() {
  return (
    <main className="premium-page-shell min-h-screen text-luxury-ivory">
      <Navbar />
      <section className="mx-auto flex max-w-3xl flex-col px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href="/chat"
          className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-luxury-champagne transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao chat
        </Link>

        <div className="premium-surface-card rounded-3xl p-6 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-luxury-gold/35 bg-luxury-gold/10 text-luxury-champagne">
            <LockKeyhole className="h-7 w-7" />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-luxury-champagne">
            Limite gratuito concluído
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
            Benefícios Premiere
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-luxury-muted sm:text-base">
            O Premiere inclui moldura vitalícia, 3 Boosts e um mês de Premium.
            Depois desse período, mensagens e outros recursos pagos dependem de
            uma assinatura ativa.
          </p>

          <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-luxury-gold/20 bg-luxury-gold/5 px-4 py-3 text-left text-xs font-semibold leading-5 text-luxury-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-luxury-champagne" />
            O pagamento é feito por PIX e a liberação ocorre automaticamente
            após a confirmação.
          </div>

          <div className="mx-auto mt-7 max-w-md">
            <PremiereOfferDialog initialOpen initialStep="payment" />
          </div>
        </div>
      </section>
    </main>
  );
}
