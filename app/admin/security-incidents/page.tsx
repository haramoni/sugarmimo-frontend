"use client";

import {
  AlertTriangle,
  Archive,
  BellRing,
  CalendarClock,
  ChevronRight,
  CircleDot,
  FileCheck2,
  FileKey2,
  LoaderCircle,
  Plus,
  RefreshCw,
  Scale,
  ShieldAlert,
  Siren,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  IncidentListResponse,
  SecurityIncident,
} from "./types";

const statuses = [
  "OPEN",
  "CONTAINED",
  "INVESTIGATING",
  "ASSESSING",
  "NOTIFYING",
  "REMEDIATING",
  "CLOSED",
];

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  CONTAINED: "Contido",
  INVESTIGATING: "Em investigação",
  ASSESSING: "Avaliando risco",
  NOTIFYING: "Comunicando",
  REMEDIATING: "Em remediação",
  CLOSED: "Encerrado",
};

const severityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-black/12 bg-white px-3 py-2 text-sm font-medium text-black-jewel outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15";
const labelClass =
  "block text-xs font-extrabold uppercase tracking-wide text-black-jewel/55";

type CreateForm = {
  title: string;
  description: string;
  severity: string;
  occurredAt: string;
  detectedAt: string;
  controllerAwareAt: string;
  natureAndCategories: string;
  affectedDataSubjectCount: string;
  sensitiveData: boolean;
  vulnerableDataSubjects: boolean;
  financialData: boolean;
  authenticationData: boolean;
  legallyProtectedData: boolean;
  largeScale: boolean;
  relevantRisk: "PENDING" | "YES" | "NO";
  riskAssessment: string;
  containmentMeasures: string;
  affectedIdentifiers: string;
};

function initialCreateForm(): CreateForm {
  const now = toLocalDateTime(new Date());
  return {
    title: "",
    description: "",
    severity: "MEDIUM",
    occurredAt: "",
    detectedAt: now,
    controllerAwareAt: now,
    natureAndCategories: "",
    affectedDataSubjectCount: "",
    sensitiveData: false,
    vulnerableDataSubjects: false,
    financialData: false,
    authenticationData: false,
    legallyProtectedData: false,
    largeScale: false,
    relevantRisk: "PENDING",
    riskAssessment: "",
    containmentMeasures: "",
    affectedIdentifiers: "",
  };
}

export default function SecurityIncidentsPage() {
  const router = useRouter();
  const [response, setResponse] = useState<IncidentListResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<SecurityIncident | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const query = statusFilter
      ? `?status=${encodeURIComponent(statusFilter)}`
      : "";
    const apiResponse = await fetch(`/api/admin/security-incidents${query}`, {
      cache: "no-store",
    }).catch(() => null);

    if (apiResponse?.status === 401 || apiResponse?.status === 403) {
      router.push("/admin/login");
      return;
    }

    const result = (await apiResponse?.json().catch(() => null)) as
      | IncidentListResponse
      | { message?: string }
      | null;
    if (!apiResponse?.ok || !result || !("items" in result)) {
      setError(
        (result && "message" in result && result.message) ||
          "Não foi possível carregar os incidentes.",
      );
    } else {
      setResponse(result);
    }
    setIsLoading(false);
  }, [router, statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const stats = useMemo(() => {
    const items = response?.items ?? [];
    return {
      open: items.filter((item) => item.status !== "CLOSED").length,
      urgent: items.filter(
        (item) =>
          item.relevantRisk === true &&
          !item.anpdNotifiedAt,
      ).length,
      pendingRisk: items.filter((item) => item.relevantRisk === null).length,
    };
  }, [response]);

  async function openIncident(id: string) {
    setError("");
    const apiResponse = await fetch(
      `/api/admin/security-incidents/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    ).catch(() => null);
    const result = (await apiResponse?.json().catch(() => null)) as
      | SecurityIncident
      | { message?: string }
      | null;

    if (!apiResponse?.ok || !result || !("id" in result)) {
      setError(
        (result && "message" in result && result.message) ||
          "Não foi possível abrir o incidente.",
      );
      return;
    }
    setSelected(result);
  }

  async function refreshSelected() {
    if (selected) await openIncident(selected.id);
    await load();
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] px-4 pb-12 pt-20 text-black-jewel sm:px-6 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-ruby">
              <Siren className="size-5" aria-hidden="true" />
              Resposta a incidentes
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              Incidentes de segurança
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-black-jewel/60">
              Registro restrito para avaliação, evidências e comunicação conforme
              a Resolução CD/ANPD nº 15/2024.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw className="size-4" /> Atualizar
            </Button>
            <Button
              className="bg-ruby text-white hover:bg-ruby/85"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" /> Registrar incidente
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-gold/25 bg-linear-to-r from-[#fff8e9] to-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Scale className="mt-0.5 size-6 shrink-0 text-gold" />
            <div>
              <h2 className="font-bold">Controle regulatório</h2>
              <p className="mt-1 text-sm leading-6 text-black-jewel/65">
                Registre todos os incidentes, mesmo sem comunicação externa.
                Para risco ou dano relevante, acompanhe o prazo de três dias
                úteis desde a ciência do controlador. A retenção mínima de cada
                registro é de cinco anos.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={CircleDot} label="Incidentes abertos" value={stats.open} />
          <StatCard icon={AlertTriangle} label="Comunicação pendente" value={stats.urgent} danger />
          <StatCard icon={Scale} label="Risco não concluído" value={stats.pendingRisk} />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <label className={labelClass}>
            Filtrar por status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={`${fieldClass} min-w-56`}
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <section className="space-y-3">
          {isLoading ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-black/8 bg-white">
              <LoaderCircle className="size-7 animate-spin text-gold" />
            </div>
          ) : !response?.items.length ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center">
              <ShieldAlert className="mx-auto size-9 text-emerald" />
              <h2 className="mt-3 font-bold">Nenhum incidente registrado</h2>
              <p className="mt-1 text-sm text-black-jewel/55">
                Use “Registrar incidente” assim que houver suspeita envolvendo
                dados pessoais.
              </p>
            </div>
          ) : (
            response.items.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onOpen={() => void openIncident(incident.id)}
              />
            ))
          )}
        </section>
      </div>

      <CreateIncidentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (incident) => {
          setCreateOpen(false);
          await load();
          await openIncident(incident.id);
        }}
      />
      <IncidentDetailDialog
        incident={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onChanged={refreshSelected}
      />
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof CircleDot;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-black-jewel/60">{label}</span>
        <Icon className={`size-5 ${danger ? "text-ruby" : "text-gold"}`} />
      </div>
      <p className={`mt-3 text-3xl font-black ${danger ? "text-ruby" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function IncidentCard({
  incident,
  onOpen,
}: {
  incident: SecurityIncident;
  onOpen: () => void;
}) {
  const deadline = deadlineState(incident);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full rounded-2xl border border-black/8 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{statusLabels[incident.status] ?? incident.status}</Badge>
            <Badge danger={["HIGH", "CRITICAL"].includes(incident.severity)}>
              Severidade {severityLabels[incident.severity] ?? incident.severity}
            </Badge>
            {incident.relevantRisk === null ? (
              <Badge warning>Risco pendente</Badge>
            ) : incident.relevantRisk ? (
              <Badge danger>Risco relevante</Badge>
            ) : (
              <Badge safe>Sem risco relevante</Badge>
            )}
          </div>
          <h2 className="mt-3 truncate text-lg font-bold">{incident.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-black-jewel/60">
            {incident.description}
          </p>
        </div>
        <div className="grid shrink-0 gap-2 text-sm sm:grid-cols-3 lg:min-w-[520px]">
          <MiniInfo icon={CalendarClock} label="Prazo ANPD" value={deadline.label} danger={deadline.danger} />
          <MiniInfo icon={UsersRound} label="Titulares" value={String(incident._count.recipients)} />
          <MiniInfo icon={FileKey2} label="Evidências" value={String(incident._count.evidence)} />
        </div>
        <ChevronRight className="hidden size-5 shrink-0 text-gold transition group-hover:translate-x-1 lg:block" />
      </div>
    </button>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] p-3">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-black-jewel/45">
        <Icon className={`size-3.5 ${danger ? "text-ruby" : "text-gold"}`} /> {label}
      </p>
      <p className={`mt-1 font-bold ${danger ? "text-ruby" : ""}`}>{value}</p>
    </div>
  );
}

function CreateIncidentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (incident: SecurityIncident) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateForm>(initialCreateForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const result = await requestJson<{
      incident: SecurityIncident;
      unmatchedIdentifiers: string[];
    }>("/api/admin/security-incidents", "POST", {
      title: form.title,
      description: form.description,
      severity: form.severity,
      occurredAt: form.occurredAt ? toIso(form.occurredAt) : undefined,
      detectedAt: toIso(form.detectedAt),
      controllerAwareAt: toIso(form.controllerAwareAt),
      natureAndCategories: form.natureAndCategories,
      affectedDataSubjectCount: form.affectedDataSubjectCount
        ? Number(form.affectedDataSubjectCount)
        : undefined,
      sensitiveData: form.sensitiveData,
      vulnerableDataSubjects: form.vulnerableDataSubjects,
      financialData: form.financialData,
      authenticationData: form.authenticationData,
      legallyProtectedData: form.legallyProtectedData,
      largeScale: form.largeScale,
      relevantRisk:
        form.relevantRisk === "PENDING"
          ? undefined
          : form.relevantRisk === "YES",
      riskAssessment: form.riskAssessment || undefined,
      containmentMeasures: form.containmentMeasures || undefined,
      affectedIdentifiers: splitIdentifiers(form.affectedIdentifiers),
    });
    setIsSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setForm(initialCreateForm());
    await onCreated(result.data.incident);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-gold/20 bg-[#fffaf2] px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
            <Siren className="size-6 text-ruby" /> Registrar incidente
          </DialogTitle>
          <DialogDescription>
            Abra o registro imediatamente. Informações em apuração podem ser
            atualizadas depois.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" required>
              <input required minLength={5} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Severidade" required>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={fieldClass}>
                {Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Descrição interna" required hint="Não inclua senhas, tokens ou segredos desnecessários.">
            <textarea required minLength={10} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ocorrência estimada">
              <input type="datetime-local" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Detecção" required>
              <input required type="datetime-local" value={form.detectedAt} onChange={(e) => setForm({ ...form, detectedAt: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Ciência do controlador" required hint="Base do prazo regulatório.">
              <input required type="datetime-local" value={form.controllerAwareAt} onChange={(e) => setForm({ ...form, controllerAwareAt: e.target.value })} className={fieldClass} />
            </Field>
          </div>
          <Field label="Natureza do incidente e categorias de dados" required>
            <textarea required minLength={5} rows={3} value={form.natureAndCategories} onChange={(e) => setForm({ ...form, natureAndCategories: e.target.value })} className={fieldClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quantidade estimada de titulares">
              <input type="number" min={0} value={form.affectedDataSubjectCount} onChange={(e) => setForm({ ...form, affectedDataSubjectCount: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Usuários afetados" hint="Usuário ou e-mail, separados por linha ou vírgula.">
              <textarea rows={2} value={form.affectedIdentifiers} onChange={(e) => setForm({ ...form, affectedIdentifiers: e.target.value })} className={fieldClass} />
            </Field>
          </div>
          <div>
            <p className={labelClass}>Critérios de atenção previstos na norma</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["sensitiveData", "Dados sensíveis"],
                ["vulnerableDataSubjects", "Titulares vulneráveis"],
                ["financialData", "Dados financeiros"],
                ["authenticationData", "Dados de autenticação"],
                ["legallyProtectedData", "Dados protegidos por sigilo"],
                ["largeScale", "Tratamento em larga escala"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-black/8 p-3 text-sm font-semibold">
                  <input type="checkbox" checked={Boolean(form[key as keyof CreateForm])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} /> {label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Risco ou dano relevante">
              <select value={form.relevantRisk} onChange={(e) => setForm({ ...form, relevantRisk: e.target.value as CreateForm["relevantRisk"] })} className={fieldClass}>
                <option value="PENDING">Avaliação pendente</option>
                <option value="YES">Sim</option>
                <option value="NO">Não</option>
              </select>
            </Field>
            <Field label="Medidas imediatas de contenção">
              <textarea rows={2} value={form.containmentMeasures} onChange={(e) => setForm({ ...form, containmentMeasures: e.target.value })} className={fieldClass} />
            </Field>
          </div>
          <Field label="Justificativa da avaliação de risco">
            <textarea rows={3} value={form.riskAssessment} onChange={(e) => setForm({ ...form, riskAssessment: e.target.value })} className={fieldClass} />
          </Field>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <div className="flex justify-end gap-2 border-t border-black/8 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={isSaving} className="bg-ruby text-white hover:bg-ruby/85">
              {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />} Salvar registro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentDetailDialog({
  incident,
  open,
  onOpenChange,
  onChanged,
}: {
  incident: SecurityIncident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void>;
}) {
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!incident) return null;

  async function runAction<T>(label: string, promise: Promise<ApiResult<T>>) {
    setBusyAction(label);
    setError("");
    setSuccess("");
    const result = await promise;
    setBusyAction("");
    if (!result.ok) {
      setError(result.message);
      return false;
    }
    setSuccess("Registro atualizado com sucesso.");
    await onChanged();
    return true;
  }

  const deadline = deadlineState(incident);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-gold/20 bg-[#fffaf2] px-6 py-5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{statusLabels[incident.status] ?? incident.status}</Badge>
            <Badge danger={["HIGH", "CRITICAL"].includes(incident.severity)}>{severityLabels[incident.severity]}</Badge>
          </div>
          <DialogTitle className="mt-2 font-serif text-2xl">{incident.title}</DialogTitle>
          <DialogDescription>Protocolo {incident.id.slice(0, 8).toUpperCase()} · criado em {formatDateTime(incident.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniInfo icon={CalendarClock} label="Prazo estimado ANPD" value={deadline.label} danger={deadline.danger} />
            <MiniInfo icon={Archive} label="Retenção mínima até" value={formatDate(incident.retentionUntil)} />
            <MiniInfo icon={UsersRound} label="Titulares vinculados" value={String(incident._count.recipients)} />
          </div>

          <section className="rounded-xl border border-black/8 p-4">
            <h3 className="font-bold">Resumo e avaliação</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black-jewel/70">{incident.description}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <DetailTerm label="Ciência do controlador" value={formatDateTime(incident.controllerAwareAt)} />
              <DetailTerm label="Natureza e dados" value={incident.natureAndCategories} />
              <DetailTerm label="Risco relevante" value={incident.relevantRisk === null ? "Pendente" : incident.relevantRisk ? "Sim" : "Não"} />
              <DetailTerm label="Justificativa" value={incident.riskAssessment || "Não informada"} />
              <DetailTerm label="Contenção" value={incident.containmentMeasures || "Não informada"} />
              <DetailTerm label="Comunicação ANPD" value={incident.anpdNotifiedAt ? `${formatDateTime(incident.anpdNotifiedAt)} · ${incident.anpdProtocol}` : "Não registrada"} />
            </dl>
          </section>

          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {success ? <p role="status" className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-bold text-emerald">{success}</p> : null}

          <StatusAction incident={incident} busy={Boolean(busyAction)} onSubmit={(payload) => runAction("status", requestJson(`/api/admin/security-incidents/${incident.id}`, "PATCH", payload))} />
          <AffectedUsersAction busy={Boolean(busyAction)} onSubmit={(identifiers) => runAction("users", requestJson(`/api/admin/security-incidents/${incident.id}/affected-users`, "POST", { identifiers }))} />
          <EvidenceAction busy={Boolean(busyAction)} onSubmit={(payload) => runAction("evidence", requestJson(`/api/admin/security-incidents/${incident.id}/evidence`, "POST", payload))} />
          <NotificationAction incident={incident} busy={Boolean(busyAction)} onSubmit={(payload) => runAction("notice", requestJson(`/api/admin/security-incidents/${incident.id}/notify-data-subjects`, "POST", payload))} />
          <AnpdAction incident={incident} busy={Boolean(busyAction)} onSubmit={(payload) => runAction("anpd", requestJson(`/api/admin/security-incidents/${incident.id}/anpd-communication`, "POST", payload))} />

          <section className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-bold"><UsersRound className="size-4 text-gold" /> Titulares</h3>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {incident.recipients?.length ? incident.recipients.map((recipient) => (
                  <div key={`${recipient.userId ?? "deleted"}-${recipient.emailSnapshot}`} className="rounded-lg border border-black/8 p-3 text-sm">
                    <p className="font-bold">{recipient.user ? `@${recipient.user.username}` : "Conta excluída"}</p>
                    <p className="text-black-jewel/55">{recipient.emailSnapshot}</p>
                    <p className="mt-1 text-xs font-semibold text-black-jewel/50">
                      {recipient.acknowledgedAt ? `Ciente em ${formatDateTime(recipient.acknowledgedAt)}` : recipient.notifiedAt ? "Aviso pendente de ciência" : "Ainda não comunicado"}
                    </p>
                    {recipient.emailError ? <p className="mt-1 text-xs font-bold text-ruby">{recipient.emailError}</p> : null}
                  </div>
                )) : <EmptyText>Nenhum titular vinculado.</EmptyText>}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-bold"><FileKey2 className="size-4 text-gold" /> Evidências</h3>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {incident.evidence?.length ? incident.evidence.map((evidence) => (
                  <div key={evidence.id} className="rounded-lg border border-black/8 p-3 text-sm">
                    <p className="font-bold">{evidence.category} · {formatDateTime(evidence.collectedAt)}</p>
                    <p className="mt-1 text-black-jewel/65">{evidence.description}</p>
                    <p className="mt-1 break-all font-mono text-xs text-black-jewel/50">{evidence.storageReference}</p>
                  </div>
                )) : <EmptyText>Nenhuma evidência registrada.</EmptyText>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-bold"><FileCheck2 className="size-4 text-gold" /> Linha do tempo</h3>
            <div className="mt-3 space-y-2">
              {incident.events?.map((event) => (
                <div key={event.id} className="flex gap-3 rounded-lg border border-black/8 p-3 text-sm">
                  <CircleDot className="mt-0.5 size-4 shrink-0 text-gold" />
                  <div><p className="font-bold">{event.action}</p><p className="text-black-jewel/60">{event.notes}</p><p className="mt-1 text-xs text-black-jewel/40">{formatDateTime(event.createdAt)}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionBox({ title, icon: Icon, description, children }: { title: string; icon: typeof ShieldAlert; description: string; children: React.ReactNode }) {
  return <details className="group rounded-xl border border-black/8 bg-white"><summary className="flex cursor-pointer list-none items-center gap-3 p-4"><Icon className="size-5 text-gold" /><span className="flex-1"><strong className="block">{title}</strong><span className="text-sm text-black-jewel/55">{description}</span></span><ChevronRight className="size-4 transition group-open:rotate-90" /></summary><div className="border-t border-black/8 p-4">{children}</div></details>;
}

function StatusAction({ incident, busy, onSubmit }: { incident: SecurityIncident; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [status, setStatus] = useState(incident.status);
  const [risk, setRisk] = useState(incident.relevantRisk === null ? "PENDING" : incident.relevantRisk ? "YES" : "NO");
  const [assessment, setAssessment] = useState(incident.riskAssessment ?? "");
  return <ActionBox title="Atualizar avaliação e status" icon={Scale} description="Registre a decisão humana e o andamento operacional."><div className="grid gap-3 sm:grid-cols-3"><Field label="Status"><select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></Field><Field label="Risco relevante"><select className={fieldClass} value={risk} onChange={(e) => setRisk(e.target.value)}><option value="PENDING">Pendente</option><option value="YES">Sim</option><option value="NO">Não</option></select></Field><Field label="Justificativa"><textarea className={fieldClass} rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)} /></Field></div><Button disabled={busy} className="mt-3 bg-espresso text-white" onClick={() => void onSubmit({ status, relevantRisk: risk === "PENDING" ? undefined : risk === "YES", riskAssessment: assessment })}>Salvar avaliação</Button></ActionBox>;
}

function AffectedUsersAction({ busy, onSubmit }: { busy: boolean; onSubmit: (identifiers: string[]) => Promise<boolean> }) {
  const [value, setValue] = useState("");
  return <ActionBox title="Vincular titulares afetados" icon={UsersRound} description="Use usuário ou e-mail; não inclua administradores."><Field label="Identificadores" hint="Um por linha ou separados por vírgula."><textarea className={fieldClass} rows={3} value={value} onChange={(e) => setValue(e.target.value)} /></Field><Button disabled={busy || !splitIdentifiers(value).length} className="mt-3 bg-espresso text-white" onClick={async () => { if (await onSubmit(splitIdentifiers(value))) setValue(""); }}>Adicionar titulares</Button></ActionBox>;
}

function EvidenceAction({ busy, onSubmit }: { busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [category, setCategory] = useState("LOG"); const [description, setDescription] = useState(""); const [reference, setReference] = useState(""); const [sha256, setSha256] = useState(""); const [collectedAt, setCollectedAt] = useState(toLocalDateTime(new Date()));
  return <ActionBox title="Registrar evidência" icon={FileKey2} description="O arquivo sensível permanece no repositório forense; registre a referência e o hash."><div className="grid gap-3 sm:grid-cols-2"><Field label="Categoria"><select className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)}>{["LOG","SCREENSHOT","DATABASE_EXPORT","PROVIDER_REPORT","FORENSIC_IMAGE","OTHER"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Coletada em"><input type="datetime-local" className={fieldClass} value={collectedAt} onChange={(e) => setCollectedAt(e.target.value)} /></Field><Field label="Referência segura"><input className={fieldClass} value={reference} onChange={(e) => setReference(e.target.value)} /></Field><Field label="SHA-256 (opcional)"><input className={fieldClass} maxLength={64} value={sha256} onChange={(e) => setSha256(e.target.value)} /></Field></div><Field label="Descrição"><textarea className={fieldClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field><Button disabled={busy || description.length < 5 || reference.length < 3} className="mt-3 bg-espresso text-white" onClick={async () => { if (await onSubmit({ category, description, storageReference: reference, sha256: sha256 || undefined, collectedAt: toIso(collectedAt) })) { setDescription(""); setReference(""); setSha256(""); } }}>Registrar evidência</Button></ActionBox>;
}

function NotificationAction({ incident, busy, onSubmit }: { incident: SecurityIncident; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [nature, setNature] = useState(incident.natureAndCategories); const [consequences, setConsequences] = useState(incident.likelyConsequences ?? ""); const [security, setSecurity] = useState(incident.securityMeasures ?? ""); const [mitigation, setMitigation] = useState(incident.mitigationMeasures ?? ""); const [delay, setDelay] = useState(incident.delayReason ?? ""); const [contact, setContact] = useState(incident.contactChannel);
  return <ActionBox title="Comunicar titulares" icon={BellRing} description="Publica aviso obrigatório na conta e tenta envio individual por e-mail."><div className="rounded-lg bg-ruby/7 p-3 text-sm font-semibold text-ruby">Revise o texto: não revele segredo comercial, credencial ou detalhe que amplie o risco.</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Natureza e dados"><textarea className={fieldClass} rows={3} value={nature} onChange={(e) => setNature(e.target.value)} /></Field><Field label="Riscos e possíveis consequências"><textarea className={fieldClass} rows={3} value={consequences} onChange={(e) => setConsequences(e.target.value)} /></Field><Field label="Medidas técnicas e de segurança"><textarea className={fieldClass} rows={3} value={security} onChange={(e) => setSecurity(e.target.value)} /></Field><Field label="Mitigação ou reversão"><textarea className={fieldClass} rows={3} value={mitigation} onChange={(e) => setMitigation(e.target.value)} /></Field><Field label="Motivo de eventual atraso"><textarea className={fieldClass} rows={2} value={delay} onChange={(e) => setDelay(e.target.value)} /></Field><Field label="Canal para esclarecimentos"><input className={fieldClass} value={contact} onChange={(e) => setContact(e.target.value)} /></Field></div><Button disabled={busy || incident.relevantRisk !== true || !incident._count.recipients || [nature, consequences, security, mitigation, contact].some((value) => value.trim().length < 5)} className="mt-3 bg-ruby text-white hover:bg-ruby/85" onClick={() => void onSubmit({ natureAndCategories: nature, likelyConsequences: consequences, securityMeasures: security, mitigationMeasures: mitigation, delayReason: delay || undefined, contactChannel: contact })}><BellRing className="size-4" /> Comunicar {incident._count.recipients} titular(es)</Button>{incident.relevantRisk !== true ? <p className="mt-2 text-xs font-bold text-ruby">Conclua a avaliação como risco relevante para habilitar.</p> : null}</ActionBox>;
}

function AnpdAction({ incident, busy, onSubmit }: { incident: SecurityIncident; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [notifiedAt, setNotifiedAt] = useState(toLocalDateTime(incident.anpdNotifiedAt ? new Date(incident.anpdNotifiedAt) : new Date())); const [protocol, setProtocol] = useState(incident.anpdProtocol ?? ""); const [notes, setNotes] = useState("");
  return <ActionBox title="Registrar comunicação à ANPD" icon={FileCheck2} description="Este botão registra o protocolo; o peticionamento é realizado no canal oficial da ANPD."><div className="grid gap-3 sm:grid-cols-2"><Field label="Data e hora"><input type="datetime-local" className={fieldClass} value={notifiedAt} onChange={(e) => setNotifiedAt(e.target.value)} /></Field><Field label="Protocolo"><input className={fieldClass} value={protocol} onChange={(e) => setProtocol(e.target.value)} /></Field></div><Field label="Observação"><textarea className={fieldClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field><Button disabled={busy || incident.relevantRisk !== true || protocol.trim().length < 3} className="mt-3 bg-espresso text-white" onClick={() => void onSubmit({ notifiedAt: toIso(notifiedAt), protocol, notes: notes || undefined })}>Registrar protocolo</Button></ActionBox>;
}

function Field({ label, hint, required = false, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <label className={labelClass}>{label}{required ? " *" : ""}{children}{hint ? <span className="mt-1 block text-[0.68rem] normal-case tracking-normal text-black-jewel/45">{hint}</span> : null}</label>; }
function DetailTerm({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-extrabold uppercase tracking-wide text-black-jewel/45">{label}</dt><dd className="mt-1 whitespace-pre-wrap font-semibold leading-6">{value}</dd></div>; }
function Badge({ children, danger = false, safe = false, warning = false }: { children: React.ReactNode; danger?: boolean; safe?: boolean; warning?: boolean }) { const color = danger ? "bg-ruby/10 text-ruby" : safe ? "bg-emerald/10 text-emerald" : warning ? "bg-gold/12 text-gold" : "bg-black/6 text-black-jewel/65"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide ${color}`}>{children}</span>; }
function ErrorMessage({ children }: { children: React.ReactNode }) { return <p role="alert" className="rounded-lg bg-ruby/10 px-3 py-2 text-sm font-bold text-ruby">{children}</p>; }
function EmptyText({ children }: { children: React.ReactNode }) { return <p className="rounded-lg border border-dashed border-black/12 p-4 text-sm text-black-jewel/50">{children}</p>; }

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };
async function requestJson<T>(url: string, method: string, body: unknown): Promise<ApiResult<T>> { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null); const result = await response?.json().catch(() => null) as T | { message?: string } | null; if (!response?.ok) return { ok: false, message: (result && typeof result === "object" && "message" in result && result.message) || "Não foi possível concluir a operação." }; return { ok: true, data: result as T }; }
function splitIdentifiers(value: string) { return [...new Set(value.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean))]; }
function toIso(value: string) { return new Date(value).toISOString(); }
function toLocalDateTime(date: Date) { const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value)); }
function deadlineState(incident: SecurityIncident) { if (incident.anpdNotifiedAt) return { label: `Comunicada em ${formatDate(incident.anpdNotifiedAt)}`, danger: false }; if (incident.relevantRisk !== true) return { label: formatDateTime(incident.anpdDeadlineAt), danger: false }; const diff = new Date(incident.anpdDeadlineAt).getTime() - Date.now(); if (diff < 0) return { label: `Vencido · ${formatDateTime(incident.anpdDeadlineAt)}`, danger: true }; const hours = Math.max(1, Math.ceil(diff / 3_600_000)); return { label: `${hours}h · ${formatDateTime(incident.anpdDeadlineAt)}`, danger: hours <= 24 }; }
