import type { Metadata } from "next";
import { FileText } from "lucide-react";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";
import termsContent from "./terms-content.json";

export const metadata: Metadata = {
  title: "Termos de Uso e Condições Gerais de Utilização | SugarMimo",
  description:
    "Termos de Uso e Condições Gerais de Utilização da plataforma SugarMimo.",
};

export default function TermsPage() {
  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <header className="border-b border-gold/35 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-6 pb-12 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-normal text-gold">
            <FileText className="size-4" aria-hidden="true" />
            Documento integral
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-black-jewel sm:text-5xl">
            Termos de Uso e Condições Gerais de Utilização
          </h1>
          <p className="mt-4 text-sm font-semibold text-black-jewel/60">
            Versão consolidada de 18 de agosto de 2026
          </p>
        </div>
      </header>

      <section className="bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 py-8 sm:px-8 sm:py-12 lg:px-12">
        <article
          aria-label="Texto integral dos Termos de Uso"
          className="mx-auto max-w-5xl rounded-xl border border-gold/25 bg-white px-5 py-8 shadow-[0_18px_60px_rgba(20,17,14,0.12)] sm:px-10 sm:py-12"
        >
          <pre className="whitespace-pre-wrap font-sans text-sm font-medium leading-7 text-black-jewel/82 sm:text-base sm:leading-8">
            {termsContent.text}
          </pre>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
