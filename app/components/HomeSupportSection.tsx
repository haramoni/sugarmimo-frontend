"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  Headphones,
  LoaderCircle,
  Mail,
  MessageSquareWarning,
  Phone,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";
import { FormEvent, useState } from "react";

import { contact } from "@/lib/contact";

type Ticket = {
  protocol: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  events: Array<{ status: string; note: string; createdAt: string }>;
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Recebido",
  IN_PROGRESS: "Em atendimento",
  WAITING_USER: "Aguardando sua resposta",
  RESOLVED: "Resolvido",
  CLOSED: "Encerrado",
};

const channels = [
  {
    title: "Atendimento geral",
    value: contact.email,
    href: `mailto:${contact.email}`,
    icon: Headphones,
  },
  {
    title: "Privacidade e LGPD",
    value: contact.privacyEmail,
    href: `mailto:${contact.privacyEmail}`,
    icon: ShieldCheck,
  },
  {
    title: "Denúncias e segurança",
    value: contact.securityEmail,
    href: `mailto:${contact.securityEmail}`,
    icon: MessageSquareWarning,
  },
  {
    title: "Telefone e WhatsApp",
    value: contact.whatsappDisplay,
    href: `tel:+${contact.whatsappNumber}`,
    icon: Phone,
  },
];

export function HomeSupportSection() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  async function findTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    setError("");
    setTicket(null);
    const form = new FormData(event.currentTarget);
    const protocol = String(form.get("protocol") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const response = await fetch(
      `/api/contact/tickets/${encodeURIComponent(protocol)}?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    ).catch(() => null);
    const result = (await response?.json().catch(() => null)) as
      | Ticket
      | { message?: string }
      | null;
    setIsSearching(false);

    if (!response?.ok || !result || !("protocol" in result)) {
      setError(
        (result && "message" in result && result.message) ||
          "Não foi possível consultar o protocolo.",
      );
      return;
    }
    setTicket(result);
  }

  return (
    <section
      id="atendimento"
      className="scroll-mt-24 border-b border-luxury-gold/22 bg-transparent px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-luxury-champagne">
              <Headphones className="size-5" aria-hidden="true" />
              Atendimento SugarMimo
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Canais claros para cada tipo de solicitação.
            </h2>
            <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-luxury-muted">
              Escolha o canal adequado ou abra uma solicitação para receber um
              protocolo e acompanhar o histórico do atendimento.
            </p>
          </div>
          <div className="premium-surface-card flex items-start gap-3 rounded-2xl p-5">
            <Clock3 className="mt-0.5 size-6 shrink-0 text-luxury-champagne" />
            <div>
              <p className="font-extrabold">Horário de atendimento</p>
              <p className="mt-1 text-sm leading-6 text-luxury-muted">
                Canais disponíveis 24 horas para envio. As solicitações são
                analisadas e respondidas em dias úteis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {channels.map(({ title, value, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              className="premium-surface-card group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-luxury-champagne"
            >
              <span className="premium-icon-medallion size-11 rounded-xl transition group-hover:bg-luxury-champagne group-hover:text-luxury-ink">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 break-all text-sm font-semibold text-luxury-muted">
                {value}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SupportLink
            href="/contato?category=ATENDIMENTO"
            icon={Mail}
            title="Abrir atendimento"
            description="Dúvidas e suporte geral"
          />
          <SupportLink
            href="/contato?category=RECLAMACAO"
            icon={MessageSquareWarning}
            title="Fazer uma reclamação"
            description="Registre e acompanhe por protocolo"
          />
          <SupportLink
            href="/contato?category=CANCELAMENTO"
            icon={UserRoundX}
            title="Solicitar cancelamento"
            description="Conta, plano ou cobrança"
          />
        </div>

        <div className="premium-surface-card mt-10 grid gap-6 rounded-2xl p-5 lg:grid-cols-[0.8fr_1.2fr] sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-luxury-champagne">
              <FileSearch className="size-5" /> Consultar atendimento
            </p>
            <h3 className="mt-2 font-serif text-2xl font-semibold">
              Acompanhe seu protocolo
            </h3>
            <p className="mt-2 text-sm leading-6 text-luxury-muted">
              Informe o protocolo e o mesmo e-mail usado ao abrir a solicitação.
            </p>
            <form onSubmit={findTicket} className="mt-5 grid gap-3">
              <input
                name="protocol"
                required
                placeholder="SM-AAAAMMDD-XXXXXXXX"
                aria-label="Protocolo do atendimento"
                className="premium-field h-12 rounded-xl px-4 text-sm font-semibold uppercase outline-none"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="E-mail usado no atendimento"
                aria-label="E-mail do atendimento"
                className="premium-field h-12 rounded-xl px-4 text-sm font-semibold outline-none"
              />
              <button
                disabled={isSearching}
                className="premium-primary-action inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition disabled:opacity-60"
              >
                {isSearching ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileSearch className="size-4" />
                )}
                Consultar protocolo
              </button>
            </form>
            {error ? (
              <p role="alert" className="mt-3 text-sm font-bold text-ruby">
                {error}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-luxury-gold/16 bg-luxury-black/55 p-5">
            {ticket ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-luxury-muted/75">
                      {ticket.protocol}
                    </p>
                    <p className="mt-1 font-bold">{ticket.subject}</p>
                  </div>
                  <span className="rounded-full border border-emerald/35 bg-emerald/12 px-3 py-1 text-xs font-extrabold uppercase text-[#78d6c0]">
                    {statusLabels[ticket.status] ?? ticket.status}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {ticket.events.map((item) => (
                    <div key={`${item.status}-${item.createdAt}`} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#78d6c0]" />
                      <div>
                        <p className="text-sm font-bold">
                          {statusLabels[item.status] ?? item.status}
                        </p>
                        <p className="text-sm text-luxury-muted">{item.note}</p>
                        <p className="mt-1 text-xs text-luxury-muted/65">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center text-center">
                <div>
                  <FileSearch className="mx-auto size-10 text-gold/60" />
                  <p className="mt-3 font-bold">Histórico do atendimento</p>
                  <p className="mt-1 max-w-sm text-sm leading-6 text-luxury-muted/80">
                    O andamento e as atualizações aparecerão aqui após a consulta.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportLink({ href, icon: Icon, title, description }: { href: string; icon: typeof Mail; title: string; description: string }) {
  return (
    <Link href={href} className="premium-surface-card group flex items-center gap-4 rounded-2xl p-4 transition hover:border-luxury-champagne">
      <span className="premium-icon-medallion size-10 shrink-0 rounded-xl"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1"><strong className="block text-luxury-ivory">{title}</strong><span className="text-xs font-semibold text-luxury-muted">{description}</span></span>
      <ArrowRight className="size-4 text-luxury-champagne transition group-hover:translate-x-1" />
    </Link>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
