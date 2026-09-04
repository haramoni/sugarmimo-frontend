"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ReportMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | null;
};

type ChatReport = {
  id: string;
  category: string;
  details: string | null;
  status: string;
  resolution: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  evidenceExpiresAt: string | null;
  evidenceCount: number;
  evidenceRetentionDays: number;
  reporter: { id: string; username: string; role: string | null };
  reported: {
    id: string;
    username: string;
    role: string | null;
    approvalStatus: string;
    accountStatus: string;
    suspendedUntil: string | null;
  };
  reviewedBy: { id: string; username: string } | null;
};

const categoryLabels: Record<string, string> = {
  HARASSMENT: "Assédio",
  THREAT: "Ameaça",
  FRAUD: "Fraude",
  INAPPROPRIATE_SEXUAL_CONTENT: "Conteúdo sexual impróprio",
  EXTORTION: "Extorsão",
  SPAM: "Spam",
  FAKE_PROFILE: "Perfil falso",
  OTHER: "Outro",
};

const actionLabels = {
  DISMISSED: "Sem infração",
  WARNED: "Advertir",
  SUSPENDED: "Suspender",
  BANNED: "Banir",
};

export default function AdminChatReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChatReport | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch(
      `/api/admin/chat-reports?status=${encodeURIComponent(status)}`,
      { cache: "no-store" },
    ).catch(() => null);
    if (response?.status === 401 || response?.status === 403) {
      router.push("/admin/login");
      return;
    }
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(result?.message ?? "Não foi possível carregar as denúncias.");
      setLoading(false);
      return;
    }
    setReports((await response.json()) as ChatReport[]);
    setLoading(false);
  }, [router, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadReports]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--black)]">
      <header className="border-b border-[var(--platinum)] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Image
            src="/brand/logo-primary.webp"
            alt="SugarMimo"
            width={190}
            height={64}
            style={{ height: "auto" }}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atualizar denúncias"
              onClick={() => void loadReports()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--ruby)]">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">Moderação</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold">Denúncias do chat</h1>
            <p className="mt-1 text-sm text-black/55">
              Evidências são preservadas durante a apuração e acessadas somente
              quando necessário.
            </p>
          </div>
          <label className="text-sm font-bold">
            Situação
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ml-2 h-10 rounded-lg border border-black/12 bg-white px-3"
            >
              <option value="PENDING">Pendentes</option>
              <option value="ALL">Todas</option>
              <option value="DISMISSED">Sem infração</option>
              <option value="WARNED">Advertidas</option>
              <option value="SUSPENDED">Suspensas</option>
              <option value="BANNED">Banidas</option>
            </select>
          </label>
        </div>

        {error ? (
          <p className="mt-5 rounded-xl bg-[var(--ruby)]/8 px-4 py-3 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4">
          {loading ? (
            <EmptyState>Carregando denúncias…</EmptyState>
          ) : reports.length === 0 ? (
            <EmptyState>Nenhuma denúncia nesta situação.</EmptyState>
          ) : (
            reports.map((report) => {
              const days = report.evidenceExpiresAt
                ? remainingDays(report.evidenceExpiresAt)
                : null;
              return (
                <article
                  key={report.id}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--ruby)]/10 px-3 py-1 text-xs font-bold text-[var(--ruby)]">
                          {categoryLabels[report.category] ?? report.category}
                        </span>
                        <StatusBadge status={report.status} />
                        <span
                          className={[
                            "flex items-center gap-1 text-xs font-bold",
                            days !== null && days <= 7
                              ? "text-[var(--ruby)]"
                              : "text-black/45",
                          ].join(" ")}
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          {days === null
                            ? "Preservadas durante a apuração"
                            : days > 0
                              ? `Evidências expiram em ${days} dia${days === 1 ? "" : "s"}`
                              : "Evidências expiradas"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Person
                          label="Denunciante"
                          username={report.reporter.username}
                          role={report.reporter.role}
                        />
                        <Person
                          label="Perfil denunciado"
                          username={report.reported.username}
                          role={report.reported.role}
                        />
                      </div>
                      {report.details ? (
                        <p className="mt-4 rounded-xl bg-black/[0.035] p-3 text-sm leading-6">
                          {report.details}
                        </p>
                      ) : null}
                      <EvidencePanel report={report} />
                    </div>
                    <div className="w-full shrink-0 lg:w-48">
                      <p className="text-xs text-black/42">
                        Recebida em {formatDateTime(report.createdAt)}
                      </p>
                      {report.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => setSelected(report)}
                          className="mt-3 w-full rounded-xl bg-[var(--emerald)] px-4 py-3 text-sm font-bold text-white"
                        >
                          Avaliar denúncia
                        </button>
                      ) : (
                        <div className="mt-3 rounded-xl bg-black/[0.035] p-3 text-xs leading-5">
                          <strong className="block">
                            {report.reviewedBy?.username ?? "Administrador"}
                          </strong>
                          {report.resolution}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {selected ? (
        <ResolutionDialog
          report={selected}
          onClose={() => setSelected(null)}
          onResolved={() => {
            setSelected(null);
            void loadReports();
          }}
        />
      ) : null}
    </main>
  );
}

function EvidencePanel({ report }: { report: ChatReport }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ReportMessage[] | null>(null);
  const [error, setError] = useState("");

  async function toggleEvidence() {
    if (open) {
      setOpen(false);
      return;
    }
    if (messages !== null) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    const response = await fetch(
      `/api/admin/chat-reports/${encodeURIComponent(report.id)}/evidence`,
      { cache: "no-store" },
    ).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(result?.message ?? "Não foi possível consultar as evidências.");
      setLoading(false);
      return;
    }
    const result = (await response.json()) as { messages: ReportMessage[] };
    setMessages(result.messages);
    setOpen(true);
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-black/45">
          Evidências ({report.evidenceCount})
        </p>
        {report.evidenceCount > 0 ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void toggleEvidence()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold hover:border-[var(--gold)] disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : open ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {loading
              ? "Abrindo…"
              : open
                ? "Ocultar evidências"
                : "Ver evidências"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="rounded-xl bg-[var(--ruby)]/8 p-3 text-sm font-bold text-[var(--ruby)]">
          {error}
        </p>
      ) : null}
      {open && messages?.length ? (
        messages.map((message) => (
          <div
            key={message.id}
            className="rounded-xl border border-black/8 bg-[#fcfaf6] px-3 py-2 text-sm"
          >
            <div className="mb-1 flex justify-between text-[0.68rem] font-bold text-black/40">
              <span>
                {message.senderId === report.reported.id
                  ? report.reported.username
                  : report.reporter.username}
              </span>
              <span>{formatDateTime(message.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          </div>
        ))
      ) : report.evidenceCount === 0 ? (
        <p className="text-sm text-black/45">
          Nenhuma mensagem foi selecionada ou as evidências já expiraram.
        </p>
      ) : null}
    </div>
  );
}

function ResolutionDialog({
  report,
  onClose,
  onResolved,
}: {
  report: ChatReport;
  onClose: () => void;
  onResolved: () => void;
}) {
  const [action, setAction] = useState<keyof typeof actionLabels>("DISMISSED");
  const [resolution, setResolution] = useState("");
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (resolution.trim().length < 5) {
      setError("Registre uma justificativa com pelo menos 5 caracteres.");
      return;
    }
    setSaving(true);
    const response = await fetch(
      `/api/admin/chat-reports/${encodeURIComponent(report.id)}/resolve`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          resolution,
          ...(action === "SUSPENDED" ? { suspensionDays } : {}),
        }),
      },
    ).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(result?.message ?? "Não foi possível registrar a decisão.");
      setSaving(false);
      return;
    }
    onResolved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ruby)]">
              Decisão administrativa
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Perfil: {report.reported.username}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {Object.entries(actionLabels).map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setAction(value as keyof typeof actionLabels)}
              className={[
                "rounded-xl border px-3 py-2.5 text-sm font-bold",
                action === value
                  ? "border-[var(--ruby)] bg-[var(--ruby)]/8 text-[var(--ruby)]"
                  : "border-black/10",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
        {action === "SUSPENDED" ? (
          <label className="mt-4 block text-sm font-bold">
            Dias de suspensão
            <input
              type="number"
              min={1}
              max={365}
              value={suspensionDays}
              onChange={(event) =>
                setSuspensionDays(Number(event.target.value))
              }
              className="mt-2 h-11 w-full rounded-xl border border-black/12 px-3"
            />
          </label>
        ) : null}
        <label className="mt-4 block text-sm font-bold">
          Justificativa
          <textarea
            value={resolution}
            onChange={(event) =>
              setResolution(event.target.value.slice(0, 1000))
            }
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-black/12 p-3 outline-none focus:border-[var(--gold)]"
          />
        </label>
        {action === "BANNED" ? (
          <p className="mt-3 flex gap-2 rounded-xl bg-[var(--ruby)]/8 p-3 text-xs font-semibold text-[var(--ruby)]">
            <AlertTriangle className="h-4 w-4 shrink-0" />O perfil perderá o
            acesso imediatamente.
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm font-bold text-[var(--ruby)]">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-[var(--emerald)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Registrando…" : "Confirmar decisão"}
        </button>
      </form>
    </div>
  );
}

function Person({
  label,
  username,
  role,
}: {
  label: string;
  username: string;
  role: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/8 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-black/5">
        <UserRound className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-[0.68rem] font-bold uppercase text-black/40">
          {label}
        </span>
        <strong className="text-sm">{username}</strong>
        <span className="ml-2 text-xs text-black/40">{role ?? "-"}</span>
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const pending = status === "PENDING";
  return (
    <span
      className={[
        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
        pending
          ? "bg-[var(--gold-soft)]/35 text-black/65"
          : "bg-[var(--emerald)]/10 text-[var(--emerald)]",
      ].join(" ")}
    >
      {pending ? (
        <Flag className="h-3 w-3" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}
      {pending
        ? "Pendente"
        : (actionLabels[status as keyof typeof actionLabels] ?? status)}
    </span>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-black/15 bg-white text-sm font-semibold text-black/45">
      {children}
    </div>
  );
}

function remainingDays(value: string) {
  return Math.max(
    0,
    Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000),
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
