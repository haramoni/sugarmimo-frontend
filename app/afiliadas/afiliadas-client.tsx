"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Copy,
  Gift,
  Link2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useAuth } from "../components/AuthProvider";
import { Navbar } from "../components/ui/Navbar";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

const steps = [
  {
    icon: Link2,
    title: "Seu link é único",
    description:
      "Ele leva ao cadastro e identifica você como a responsável pelo convite.",
  },
  {
    icon: Send,
    title: "Compartilhe com intenção",
    description:
      "Envie para Daddies que tenham afinidade com a proposta e os valores do clube.",
  },
  {
    icon: UserPlus,
    title: "A indicação é registrada",
    description:
      "Quando um novo Daddy conclui o cadastro pelo link, o convite fica associado ao seu perfil.",
  },
];

export default function AfiliadasClient() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getOriginSnapshot,
    getServerOriginSnapshot,
  );
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isApprovalPending = shouldShowPendingApproval(user);
  const isSugarBaby = user?.role?.trim().toUpperCase() === "SUGAR_BABY";
  const username = user?.username?.trim() ?? "";

  const invitationUrl = useMemo(() => {
    if (!origin || !username) return "";
    return `${origin}/register?ref=${encodeURIComponent(username)}`;
  }, [origin, username]);

  const shareMessage = invitationUrl
    ? `Quero te convidar para conhecer a SugarMimo, um clube privado de relacionamentos entre adultos. Crie seu perfil pelo meu link: ${invitationUrl}`
    : "";

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  async function copyLink() {
    if (!invitationUrl) {
      setFeedback("Não foi possível gerar seu link agora.");
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setFeedback("Link copiado. Agora é só compartilhar.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setFeedback("Não foi possível copiar automaticamente. Selecione o link e copie.");
    }
  }

  async function shareLink() {
    if (!invitationUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convite SugarMimo",
          text: "Quero te convidar para conhecer a SugarMimo.",
          url: invitationUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyLink();
  }

  if (isAuthLoading) {
    return <PremiumLoadingScreen label="Preparando seu link exclusivo..." />;
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  if (!isSugarBaby) {
    return (
      <main className="premium-page-shell">
        <Navbar />
        <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-3xl place-items-center px-4 py-10 sm:px-6">
          <div className="premium-surface-card w-full rounded-2xl p-7 text-center sm:p-10">
            <span className="premium-icon-medallion mx-auto h-16 w-16 rounded-full">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-5 font-serif text-3xl font-semibold text-luxury-champagne">
              Área exclusiva para Sugar Babies
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-luxury-muted">
              O Programa de Afiliadas e os links pessoais de convite estão disponíveis para perfis Sugar Baby aprovados.
            </p>
            <Link
              href="/inicio"
              className="premium-secondary-action mt-7 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold transition"
            >
              Voltar ao início
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="premium-page-shell overflow-hidden">
        <Navbar />

        <section className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-8 h-80 w-80 rounded-full bg-luxury-gold/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-96 h-72 w-72 rounded-full bg-[#7e482b]/15 blur-3xl"
          />

          <header className="premium-page-hero rounded-2xl px-5 py-9 sm:px-9 sm:py-12 lg:px-12">
            <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/35 bg-luxury-gold/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-luxury-champagne">
                  <Sparkles className="h-3.5 w-3.5" />
                  Programa de Afiliadas
                </div>
                <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] text-luxury-ivory sm:text-5xl lg:text-6xl">
                  Boas conexões começam com um convite seu.
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-luxury-muted sm:text-lg">
                  Apresente a SugarMimo a novos Daddies e ajude a construir uma comunidade mais alinhada, discreta e respeitosa.
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-md rounded-2xl border border-luxury-champagne/45 bg-[linear-gradient(145deg,rgba(225,189,138,.14),rgba(8,7,5,.84))] p-5 shadow-[0_24px_70px_rgba(0,0,0,.38)] sm:p-6">
                <div className="absolute -right-3 -top-3 grid h-11 w-11 place-items-center rounded-full border border-luxury-champagne/60 bg-luxury-gold text-luxury-ink shadow-lg">
                  <Gift className="h-5 w-5" />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-luxury-gold">
                  Seu link pessoal
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-luxury-champagne">
                  Convite de @{username}
                </h2>

                <label htmlFor="affiliate-link" className="sr-only">
                  Link pessoal de convite
                </label>
                <div className="mt-5 flex min-w-0 items-center rounded-xl border border-luxury-gold/30 bg-black/35 p-2 pl-3 shadow-inner">
                  <input
                    id="affiliate-link"
                    value={invitationUrl}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-luxury-ivory outline-none"
                    aria-describedby="affiliate-link-help"
                  />
                  <Button
                    type="button"
                    onClick={() => void copyLink()}
                    aria-label="Copiar link pessoal"
                    className="premium-primary-action h-11 rounded-lg px-4 font-extrabold"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
                  </Button>
                </div>
                <p id="affiliate-link-help" className="mt-2 text-xs leading-5 text-luxury-muted">
                Não remova o trecho <strong className="text-luxury-champagne">?ref={username}</strong>: ele identifica sua indicação.
              </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => void shareLink()}
                    className="premium-primary-action h-12 rounded-full px-5 font-extrabold"
                  >
                    <Send className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-[#45c969]/55 bg-[#1f9d55]/10 px-5 font-extrabold text-[#8be3a4] hover:border-[#45c969] hover:bg-[#1f9d55] hover:text-white"
                  >
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>

                {feedback ? (
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-luxury-champagne" role="status" aria-live="polite">
                    <Check className="h-4 w-4" />
                    {feedback}
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          <aside className="relative mt-7 rounded-2xl border border-luxury-gold/25 bg-luxury-gold/7 p-5 sm:p-7">
              <div className="flex items-center justify-center gap-3 text-center">
                <Users className="h-5 w-5 text-luxury-gold" />
                <h2 className="font-serif text-2xl font-semibold text-luxury-ivory">
                  Compartilhe bem
                </h2>
              </div>
              <ul className="mt-5 grid gap-4 text-sm font-medium leading-6 text-luxury-muted md:grid-cols-3">
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-luxury-gold" />
                  Convide somente pessoas adultas que tenham demonstrado interesse.
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-luxury-gold" />
                  Apresente o clube com transparência, sem prometer encontros ou resultados.
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-luxury-gold" />
                  Evite mensagens em massa. Um convite pessoal combina mais com a SugarMimo.
                </li>
              </ul>
          </aside>

          <section className="relative mt-7">
            <div className="mb-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-luxury-gold">
                Como funciona
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-luxury-ivory sm:text-4xl">
                Três passos, com toda clareza
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="premium-surface-card rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="premium-icon-medallion h-11 w-11 rounded-full">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-serif text-3xl text-luxury-gold/45">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 font-serif text-2xl font-semibold text-luxury-champagne">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-luxury-muted">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function subscribeToOrigin() {
  return () => undefined;
}

function getOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "";
}
