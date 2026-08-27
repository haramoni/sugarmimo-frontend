"use client";

import {
  Clock3,
  Headset,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type TicketEvent = { id: string; status: string; note: string; createdAt: string };
type Ticket = {
  id: string;
  protocol: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  events: TicketEvent[];
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Recebido",
  IN_PROGRESS: "Em atendimento",
  WAITING_USER: "Aguardando usuário",
  RESOLVED: "Resolvido",
  CLOSED: "Encerrado",
};

const inputClass = "h-11 rounded-lg border border-black/12 bg-white px-3 text-sm font-semibold outline-none focus:border-gold focus:ring-2 focus:ring-gold/15";

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    const response = await fetch(`/api/admin/contact-tickets?${query}`).catch(() => null);
    if (response?.status === 401 || response?.status === 403) {
      router.push("/admin/login");
      return;
    }
    const result = await response?.json().catch(() => null);
    if (!response?.ok) setError(result?.message ?? "Não foi possível carregar os atendimentos.");
    else setTickets(result.items ?? []);
    setIsLoading(false);
  }, [router, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <main className="min-h-screen bg-[var(--surface)] px-4 pb-12 pt-20 text-black-jewel sm:px-6 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gold"><Headset className="size-5" /> Atendimento</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Protocolos de suporte</h1>
            <p className="mt-2 text-sm text-black-jewel/60">Acompanhe solicitações, reclamações e cancelamentos com histórico auditável.</p>
          </div>
          <Button variant="outline" onClick={() => void load()}><RefreshCw className="size-4" /> Atualizar</Button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-black/8 bg-white p-4 sm:grid-cols-[1fr_240px_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 size-4 text-black-jewel/40" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Protocolo, nome, e-mail ou assunto" className={`${inputClass} w-full pl-10`} /></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
          <Button onClick={() => void load()} className="bg-espresso text-white"><Search className="size-4" /> Buscar</Button>
        </div>

        {error ? <p role="alert" className="rounded-lg bg-ruby/10 p-3 text-sm font-bold text-ruby">{error}</p> : null}
        {isLoading ? <div className="grid min-h-48 place-items-center"><LoaderCircle className="size-7 animate-spin text-gold" /></div> : tickets.length ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onChanged={load} />)}
          </section>
        ) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center"><Headset className="mx-auto size-9 text-emerald" /><p className="mt-3 font-bold">Nenhum atendimento encontrado</p></div>}
      </div>
    </main>
  );
}

function TicketCard({ ticket, onChanged }: { ticket: Ticket; onChanged: () => Promise<void> }) {
  const [status, setStatus] = useState(ticket.status);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function update(event: FormEvent) {
    event.preventDefault(); setIsSaving(true); setError("");
    const response = await fetch(`/api/admin/contact-tickets/${ticket.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note }) }).catch(() => null);
    const result = await response?.json().catch(() => null); setIsSaving(false);
    if (!response?.ok) { setError(result?.message ?? "Não foi possível atualizar."); return; }
    setNote(""); await onChanged();
  }

  return (
    <article className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wide text-gold">{ticket.protocol} · {ticket.category}</p><h2 className="mt-1 text-lg font-bold">{ticket.subject}</h2></div><span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-extrabold uppercase text-emerald">{statusLabels[ticket.status]}</span></div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-black-jewel/50"><span className="flex items-center gap-1"><Mail className="size-3.5" /> {ticket.name} · {ticket.email}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {formatDate(ticket.createdAt)}</span></div>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-black/[0.025] p-4 text-sm leading-6 text-black-jewel/70">{ticket.message}</p>
      <div className="mt-4 space-y-2 border-l-2 border-gold/25 pl-4">{ticket.events.map((item) => <div key={item.id}><p className="text-xs font-extrabold uppercase text-black-jewel/50">{statusLabels[item.status]} · {formatDate(item.createdAt)}</p><p className="text-sm text-black-jewel/65">{item.note}</p></div>)}</div>
      <form onSubmit={update} className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto]"><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><input required minLength={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Atualização visível ao solicitante" className={inputClass} /><Button disabled={isSaving} className="bg-espresso text-white">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : "Registrar"}</Button></form>
      {error ? <p className="mt-2 text-xs font-bold text-ruby">{error}</p> : null}
    </article>
  );
}

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
