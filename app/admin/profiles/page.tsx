"use client";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Eye,
  EyeOff,
  ImageOff,
  KeyRound,
  LoaderCircle,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserRoundCheck,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { PhotoZoom } from "@/app/components/ui/PhotoZoom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminPhoto = {
  id: string;
  fileName: string | null;
  mimeType: string | null;
  sortOrder: number;
  isPrivate: boolean;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  moderationReason: string | null;
};

type AdminProfile = {
  id: string;
  username: string;
  email: string;
  accountPhone: string | null;
  role: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  state: string | null;
  approvalStatus: string;
  reapplicationCount: number;
  reapplicationPin: string | null;
  reappliedAt: string | null;
  accountStatus: string;
  suspendedUntil: string | null;
  isPremium: boolean;
  isPremiere: boolean;
  isAdminFeatured: boolean;
  boostCredits: number;
  lastActiveAt: string | null;
  createdAt: string | null;
  profileWatch: {
    id: string;
    active: boolean;
    reason: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  profileWatchMatches: Array<{
    id: string;
    ipAddress: string;
    createdAt: string;
    reviewedAt: string | null;
    watch: {
      reason: string;
      active: boolean;
      watchedUser: { id: string; username: string };
    };
  }>;
  photos: AdminPhoto[];
};

type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Stats = {
  total: number;
  babies: number;
  daddies: number;
  restricted: number;
  watched: number;
  watchAlerts: number;
};

const PAGE_SIZE = 12;

export default function AdminProfilesPage() {
  const router = useRouter();
  const latestRequestId = useRef(0);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    babies: 0,
    daddies: 0,
    restricted: 0,
    watched: 0,
    watchAlerts: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [watchStatus, setWatchStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [deletingPhotoId, setDeletingPhotoId] = useState("");
  const [error, setError] = useState("");

  const loadProfiles = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (approvalStatus) params.set("approvalStatus", approvalStatus);
      if (accountStatus) params.set("accountStatus", accountStatus);
      if (watchStatus) params.set("watchStatus", watchStatus);

      const response = await fetch(`/api/admin/profiles?${params.toString()}`);
      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.message ?? "Não foi possível carregar os perfis.",
        );
      if (requestId !== latestRequestId.current) return;

      setProfiles(result.items ?? []);
      setStats(
        result.stats ?? {
          total: 0,
          babies: 0,
          daddies: 0,
          restricted: 0,
          watched: 0,
          watchAlerts: 0,
        },
      );
      setPagination(result.pagination);
      if (
        result.pagination.totalPages > 0 &&
        page > result.pagination.totalPages
      ) {
        setPage(result.pagination.totalPages);
      }
    } catch (loadError) {
      if (requestId === latestRequestId.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar os perfis.",
        );
      }
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, [accountStatus, approvalStatus, page, role, router, search, watchStatus]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const requestedWatchStatus = new URLSearchParams(window.location.search)
        .get("watchStatus")
        ?.toUpperCase();
      if (["WATCHING", "ALERT"].includes(requestedWatchStatus ?? "")) {
        setWatchStatus(requestedWatchStatus ?? "");
        setPage(1);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function clearFilters() {
    setSearchDraft("");
    setSearch("");
    setRole("");
    setApprovalStatus("");
    setAccountStatus("");
    setWatchStatus("");
    setPage(1);
  }

  async function exportCsv() {
    setIsExporting(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (approvalStatus) params.set("approvalStatus", approvalStatus);
      if (accountStatus) params.set("accountStatus", accountStatus);
      const suffix = params.size ? `?${params.toString()}` : "";
      const response = await fetch(`/api/admin/profiles/export${suffix}`);

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message ?? "Não foi possível exportar os perfis.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        filenameFromResponse(response) ?? "usuarios-sugarmimo.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível exportar os perfis.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function updateAccount(profile: AdminProfile) {
    const activating = profile.accountStatus !== "ACTIVE";
    const confirmation = await Swal.fire({
      title: activating ? "Reativar este perfil?" : "Bloquear este perfil?",
      text: activating
        ? `${profile.username} voltará a acessar normalmente a plataforma.`
        : undefined,
      icon: activating ? "question" : "warning",
      input: activating ? undefined : "textarea",
      inputLabel: activating
        ? undefined
        : "Motivo que será exibido para a pessoa ao tentar entrar",
      inputPlaceholder: activating
        ? undefined
        : "Descreva de forma clara a razão do bloqueio...",
      inputAttributes: activating ? undefined : { maxlength: "1000" },
      showCancelButton: true,
      confirmButtonText: activating ? "Sim, reativar" : "Sim, bloquear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: activating ? "var(--emerald)" : "var(--ruby)",
      preConfirm: activating
        ? undefined
        : (value) => {
            const reason = String(value ?? "").trim();
            if (reason.length < 5) {
              Swal.showValidationMessage(
                "Informe um motivo com pelo menos 5 caracteres.",
              );
              return false;
            }
            return reason;
          },
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/${activating ? "activate" : "ban"}`,
        {
          method: "PATCH",
          ...(activating
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: confirmation.value }),
              }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.message ?? "Não foi possível alterar o acesso.",
        );
      await loadProfiles();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível alterar o acesso.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function toggleWatch(profile: AdminProfile) {
    const isWatching = profile.profileWatch?.active === true;
    const confirmation = await Swal.fire({
      title: isWatching ? "Remover este Watch?" : "Monitorar este perfil?",
      text: isWatching
        ? "Os alertas já registrados serão preservados, mas novos cadastros não serão comparados com este perfil."
        : "Novos cadastros realizados pelo mesmo IP serão sinalizados para análise. O perfil não será bloqueado.",
      icon: isWatching ? "question" : "warning",
      input: isWatching ? undefined : "textarea",
      inputLabel: isWatching ? undefined : "Motivo do monitoramento",
      inputPlaceholder: isWatching
        ? undefined
        : "Ex.: suspeita de criação de múltiplas contas...",
      inputAttributes: isWatching ? undefined : { maxlength: "1000" },
      showCancelButton: true,
      confirmButtonText: isWatching ? "Remover Watch" : "Ativar Watch",
      cancelButtonText: "Cancelar",
      confirmButtonColor: isWatching ? "var(--black)" : "#7c3aed",
      preConfirm: isWatching
        ? undefined
        : (value) => {
            const reason = String(value ?? "").trim();
            if (reason.length < 5) {
              Swal.showValidationMessage(
                "Informe um motivo com pelo menos 5 caracteres.",
              );
              return false;
            }
            return reason;
          },
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/${isWatching ? "unwatch" : "watch"}`,
        {
          method: "PATCH",
          ...(isWatching
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: confirmation.value }),
              }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível alterar o Watch.");
      }

      await loadProfiles();
      await Swal.fire({
        title: isWatching ? "Watch removido" : "Watch ativado",
        text: isWatching
          ? "Novos cadastros não serão mais comparados com este perfil."
          : result?.existingMatches > 0
            ? `${result.existingMatches} cadastro(s) existente(s) com o mesmo IP foram sinalizados.`
            : "Você receberá um alerta se outro cadastro utilizar o mesmo IP.",
        icon: "success",
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível alterar o Watch.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function removeWatchAlerts(profile: AdminProfile) {
    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/watch-alerts`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível remover o alerta Watch.",
        );
      }
      await loadProfiles();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível remover o alerta Watch.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function rescanWatch(profile: AdminProfile) {
    const confirmation = await Swal.fire({
      title: "Reanalisar este IP?",
      text: "Os alertas anteriores deste Watch serão substituídos pelos cadastros ou acessos recentes no mesmo IP. Alertas removidos poderão ser recriados por esta ação.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, reanalisar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7c3aed",
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/watch`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: profile.profileWatch?.reason }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível reanalisar o Watch.",
        );
      }

      await loadProfiles();
      await Swal.fire({
        title: "Reanálise concluída",
        text:
          result?.existingMatches > 0
            ? `${result.existingMatches} perfil(is) com o mesmo IP foram sinalizados.`
            : "Nenhum outro perfil foi encontrado usando este IP.",
        icon: "success",
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível reanalisar o Watch.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function removeAllWatchAlerts() {
    const confirmation = await Swal.fire({
      title: "Remover todos os alertas Watch?",
      text: `${stats.watchAlerts} alerta(s) serão apagados. Os perfis e os Watches ativos não serão removidos.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover todos",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--ruby)",
    });
    if (!confirmation.isConfirmed) return;

    setBusyId("all-watch-alerts");
    setError("");
    try {
      const response = await fetch("/api/admin/watch-alerts", {
        method: "DELETE",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível remover os alertas Watch.",
        );
      }

      await loadProfiles();
      await Swal.fire({
        title: "Alertas removidos",
        text: `${result?.removedAlerts ?? 0} alerta(s) foram apagados.`,
        icon: "success",
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível remover os alertas Watch.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function approveProfile(profile: AdminProfile) {
    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/approve`,
        {
          method: "PATCH",
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.message ?? "Não foi possível aprovar o perfil.",
        );
      await loadProfiles();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível aprovar o perfil.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function rejectProfile(profile: AdminProfile) {
    const confirmation = await Swal.fire({
      title: "Rejeitar este cadastro?",
      text: "A justificativa será exibida para a pessoa quando ela tentar entrar.",
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo da não aprovação",
      inputPlaceholder:
        "Explique o que precisa ser corrigido ou qual regra não foi atendida...",
      inputAttributes: { maxlength: "1000" },
      showCancelButton: true,
      confirmButtonText: "Confirmar rejeição",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--ruby)",
      preConfirm: (value) => {
        const reason = String(value ?? "").trim();
        if (reason.length < 5) {
          Swal.showValidationMessage(
            "Informe um motivo com pelo menos 5 caracteres.",
          );
          return false;
        }
        return reason;
      },
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: confirmation.value }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível rejeitar o perfil.",
        );
      }
      await loadProfiles();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível rejeitar o perfil.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function removePhoto(profile: AdminProfile, photo: AdminPhoto) {
    const confirmation = await Swal.fire({
      title: "Remover esta foto?",
      text: `A imagem será excluída permanentemente do perfil de ${profile.username}. O motivo será exibido no próximo login.`,
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo da remoção",
      inputPlaceholder: "Explique qual regra ou diretriz a foto não atende...",
      inputAttributes: { maxlength: "1000" },
      showCancelButton: true,
      confirmButtonText: "Sim, remover foto",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--ruby)",
      preConfirm: (value) => {
        const reason = String(value ?? "").trim();
        if (reason.length < 5) {
          Swal.showValidationMessage(
            "Informe um motivo com pelo menos 5 caracteres.",
          );
          return false;
        }
        return reason;
      },
    });
    if (!confirmation.isConfirmed) return;

    setDeletingPhotoId(photo.id);
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/photos/${encodeURIComponent(photo.id)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: confirmation.value }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.message ?? "Não foi possível remover a foto.");
      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? {
                ...item,
                photos: item.photos.filter(
                  (itemPhoto) => itemPhoto.id !== photo.id,
                ),
              }
            : item,
        ),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível remover a foto.",
      );
    } finally {
      setDeletingPhotoId("");
    }
  }

  async function deleteProfile(profile: AdminProfile) {
    const confirmation = await Swal.fire({
      title: "Excluir usuário definitivamente?",
      html: `Esta ação apaga <strong>${profile.username}</strong>, fotos, conversas e interações vinculadas.<br><br>Digite o nome do usuário para confirmar.`,
      input: "text",
      inputPlaceholder: profile.username,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Excluir definitivamente",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--ruby)",
      preConfirm: (value) => {
        if (String(value).trim() !== profile.username) {
          Swal.showValidationMessage("O nome do usuário não confere.");
          return false;
        }
        return true;
      },
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.message ?? "Não foi possível excluir o perfil.",
        );
      if (profiles.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadProfiles();
      await Swal.fire({
        title: "Perfil excluído",
        text: `${profile.username} foi removido.`,
        icon: "success",
      });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível excluir o perfil.",
      );
    } finally {
      setBusyId("");
    }
  }

  const hasFilters = Boolean(
    search || role || approvalStatus || accountStatus || watchStatus,
  );

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-4 pb-12 pt-20 text-[var(--black)] sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <UsersRound className="h-5 w-5" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em]">
                Comunidade
              </span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Gerenciar perfis
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              Consulte toda a base, modere fotos e controle o acesso de cada
              usuário.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start xl:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => void removeAllWatchAlerts()}
              disabled={
                stats.watchAlerts === 0 || busyId === "all-watch-alerts"
              }
              className="h-11 rounded-lg border-amber-400 bg-amber-50 font-bold text-amber-900 hover:bg-amber-100 disabled:border-black/10 disabled:bg-white disabled:text-black/35"
            >
              {busyId === "all-watch-alerts" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Remover alertas Watch
            </Button>
            <Button
              type="button"
              onClick={() => void exportCsv()}
              disabled={isExporting}
              className="h-11 rounded-lg bg-[var(--emerald)] font-bold text-white hover:bg-[var(--emerald)]/90"
            >
              {isExporting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProfiles()}
              disabled={isLoading}
              className="h-11 rounded-lg border-black/10 bg-white font-bold"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar dados
            </Button>
          </div>
        </div>

        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"
          aria-label="Resumo dos perfis"
        >
          <StatCard
            label="Perfis cadastrados"
            value={stats.total}
            icon={UsersRound}
            tone="gold"
          />
          <StatCard
            label="Sugar Babies"
            value={stats.babies}
            icon={Sparkles}
            tone="ruby"
          />
          <StatCard
            label="Sugar Daddies"
            value={stats.daddies}
            icon={Crown}
            tone="emerald"
          />
          <StatCard
            label="Acesso restrito"
            value={stats.restricted}
            icon={Ban}
            tone="black"
          />
          <StatCard
            label="Watch ativo"
            value={stats.watched}
            icon={Eye}
            tone="violet"
          />
          <StatCard
            label="Alertas Watch"
            value={stats.watchAlerts}
            icon={TriangleAlert}
            tone="amber"
          />
        </section>

        <form
          onSubmit={submitSearch}
          className="grid gap-3 rounded-xl border border-black/8 bg-white p-4 shadow-[0_12px_35px_rgba(36,21,13,0.05)] md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_170px_170px_170px_170px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Nome, e-mail ou cidade"
              className="h-11 rounded-lg border-black/10 bg-[#fbfaf7] pl-10"
            />
          </div>
          <FilterSelect
            label="Tipo de perfil"
            value={role}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="SUGAR_BABY">Sugar Baby</option>
            <option value="SUGAR_DADDY">Sugar Daddy</option>
          </FilterSelect>
          <FilterSelect
            label="Status de aprovação"
            value={approvalStatus}
            onChange={(value) => {
              setApprovalStatus(value);
              setPage(1);
            }}
          >
            <option value="">Todas aprovações</option>
            <option value="PENDING">Pendente</option>
            <option value="WAITING">Em espera</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
          </FilterSelect>
          <FilterSelect
            label="Status da conta"
            value={accountStatus}
            onChange={(value) => {
              setAccountStatus(value);
              setPage(1);
            }}
          >
            <option value="">Todas as contas</option>
            <option value="ACTIVE">Ativa</option>
            <option value="SUSPENDED">Suspensa</option>
            <option value="BANNED">Bloqueada</option>
          </FilterSelect>
          <FilterSelect
            label="Watch"
            value={watchStatus}
            onChange={(value) => {
              setWatchStatus(value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="WATCHING">Watch ativo</option>
            <option value="ALERT">Com alerta Watch</option>
          </FilterSelect>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="h-11 flex-1 rounded-lg bg-[var(--gold)] font-bold text-white hover:bg-[var(--cognac)]"
            >
              Buscar
            </Button>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Limpar filtros"
                onClick={clearFilters}
                className="h-11 w-11 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </form>

        {error ? (
          <div className="rounded-lg border border-[var(--ruby)]/15 bg-[var(--ruby)]/8 px-4 py-3 text-sm font-bold text-[var(--ruby)]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-black/8 bg-white">
            <div className="flex items-center gap-3 font-bold text-black/55">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--gold)]" />
              Carregando perfis...
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-black/15 bg-white p-8 text-center">
            <div>
              <UsersRound className="mx-auto h-8 w-8 text-black/25" />
              <p className="mt-3 font-bold">Nenhum perfil encontrado</p>
              <p className="mt-1 text-sm text-black/50">
                Tente alterar a busca ou limpar os filtros.
              </p>
            </div>
          </div>
        ) : (
          <section
            className="grid gap-4 xl:grid-cols-2"
            aria-label="Lista de perfis"
          >
            {profiles?.map((profile) => (
              <article
                key={profile.id}
                className="overflow-hidden rounded-xl border border-black/8 bg-white shadow-[0_12px_35px_rgba(36,21,13,0.06)]"
              >
                <AdminProfilePhotoCarousel
                  profile={profile}
                  deletingPhotoId={deletingPhotoId}
                  onRemove={removePhoto}
                />

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-xl font-bold">
                          {profile.username}
                        </h2>
                        {profile.isPremiere ? (
                          <Badge label="Premiere" tone="gold" />
                        ) : null}
                        {profile.isPremium ? (
                          <Badge label="Premium" tone="emerald" />
                        ) : null}
                        {profile.isAdminFeatured ? (
                          <Badge label="Destaque" tone="ruby" />
                        ) : null}
                        {profile.profileWatch?.active ? (
                          <Badge label="Watch ativo" tone="violet" />
                        ) : null}
                        {profile.profileWatchMatches?.length > 0 ? (
                          <Badge label="Alerta Watch" tone="amber" />
                        ) : null}
                        {profile.reapplicationCount > 0 &&
                        ["PENDING", "WAITING"].includes(
                          profile.approvalStatus,
                        ) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ruby/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-ruby">
                            <RotateCcw className="h-3 w-3" /> Retorno
                            {profile.reapplicationPin ? (
                              <span className="inline-flex items-center gap-1 tracking-[0.14em]">
                                <KeyRound className="h-3 w-3" />{" "}
                                {profile.reapplicationPin}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-black/50">
                        {profile.email}
                      </p>
                    </div>
                    <StatusBadge status={profile.accountStatus} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#faf7f1] p-3 text-xs sm:grid-cols-4">
                    <Info label="Perfil" value={roleLabel(profile.role)} />
                    <Info label="Gênero" value={genderLabel(profile.gender)} />
                    <Info
                      label="Idade"
                      value={
                        profile.age === null
                          ? "Não informada"
                          : `${profile.age} anos`
                      }
                    />
                    <Info
                      label="Celular privado"
                      value={profile.accountPhone ?? "Não informado"}
                    />
                    <Info
                      label="Aprovação"
                      value={approvalLabel(profile.approvalStatus)}
                    />
                    <Info label="Fotos" value={String(profile.photos.length)} />
                    <Info
                      label="Cadastro"
                      value={formatDate(profile.createdAt)}
                    />
                    {profile.reappliedAt ? (
                      <Info
                        label="Reenvio"
                        value={formatDate(profile.reappliedAt)}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-black/48">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />{" "}
                      {[profile.city, profile.state]
                        .filter(Boolean)
                        .join(", ") || "Local não informado"}
                    </span>
                    <span>
                      Última atividade:{" "}
                      {formatRelativeDate(profile.lastActiveAt)}
                    </span>
                  </div>

                  {profile.profileWatch?.active ? (
                    <div className="rounded-lg border border-violet-300/70 bg-violet-50 p-3 text-sm text-violet-950">
                      <div className="flex items-center gap-2 font-extrabold">
                        <Eye className="h-4 w-4" /> Watch ativo neste perfil
                      </div>
                      <p className="mt-1 leading-5">
                        {profile.profileWatch.reason}
                      </p>
                      <p className="mt-2 text-xs font-bold text-violet-800/75">
                        IP monitorado: {profile.profileWatch.ipAddress}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === profile.id}
                        onClick={() => void rescanWatch(profile)}
                        className="mt-3 h-8 rounded-lg border-violet-400 bg-white text-xs font-bold text-violet-900 hover:bg-violet-100"
                      >
                        {busyId === profile.id ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Reanalisar IP
                      </Button>
                    </div>
                  ) : null}

                  {profile.profileWatchMatches?.length > 0 ? (
                    <div
                      className="rounded-lg border border-amber-400/70 bg-amber-50 p-3 text-sm text-amber-950"
                      role="alert"
                    >
                      <div className="flex items-center gap-2 font-extrabold">
                        <TriangleAlert className="h-4 w-4" /> Cadastro
                        relacionado a perfil monitorado
                      </div>
                      {profile.profileWatchMatches.map((match) => (
                        <div
                          key={match.id}
                          className="mt-2 border-t border-amber-900/10 pt-2 first:border-0 first:pt-0"
                        >
                          <p>
                            Mesmo IP de{" "}
                            <strong>@{match.watch.watchedUser.username}</strong>
                            {match.watch.active
                              ? " (Watch ativo)"
                              : " (Watch encerrado)"}
                            .
                          </p>
                          <p className="mt-1 text-xs leading-5 text-amber-900/80">
                            Motivo: {match.watch.reason} · IP: {match.ipAddress}{" "}
                            · Detectado em {formatDate(match.createdAt)}
                          </p>
                        </div>
                      ))}
                      <div className="mt-3 border-t border-amber-900/10 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busyId === profile.id}
                          onClick={() => void removeWatchAlerts(profile)}
                          className="h-8 rounded-lg border-amber-500 bg-white text-xs font-bold text-amber-900 hover:bg-amber-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remover alerta
                        </Button>
                        <p className="mt-2 text-xs text-amber-900/70">
                          IP igual é apenas um sinal técnico e não comprova que
                          seja a mesma pessoa.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2 border-t border-black/8 pt-4">
                    {profile.role === "SUGAR_BABY" &&
                    ["PENDING", "WAITING", "REJECTED"].includes(
                      profile.approvalStatus,
                    ) ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === profile.id}
                        onClick={() => void approveProfile(profile)}
                        className="h-9 rounded-lg border-[var(--emerald)]/25 text-xs font-bold text-[var(--emerald)] hover:bg-[var(--emerald)]/8"
                      >
                        <ShieldCheck className="h-4 w-4" /> Aprovar
                      </Button>
                    ) : null}
                    {profile.role === "SUGAR_BABY" &&
                    ["PENDING", "WAITING"].includes(profile.approvalStatus) ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === profile.id}
                        onClick={() => void rejectProfile(profile)}
                        className="h-9 rounded-lg border-[var(--ruby)]/25 text-xs font-bold text-[var(--ruby)] hover:bg-[var(--ruby)]/8"
                      >
                        <XCircle className="h-4 w-4" /> Rejeitar
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyId === profile.id}
                      onClick={() => void toggleWatch(profile)}
                      className={`h-9 rounded-lg text-xs font-bold ${profile.profileWatch?.active ? "border-violet-300 text-violet-800 hover:bg-violet-50" : "border-amber-400/60 text-amber-800 hover:bg-amber-50"}`}
                    >
                      {busyId === profile.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : profile.profileWatch?.active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {profile.profileWatch?.active ? "Remover Watch" : "Watch"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyId === profile.id}
                      onClick={() => void updateAccount(profile)}
                      className={`h-9 rounded-lg text-xs font-bold ${profile.accountStatus === "ACTIVE" ? "border-[var(--ruby)]/25 text-[var(--ruby)] hover:bg-[var(--ruby)]/8" : "border-[var(--emerald)]/25 text-[var(--emerald)] hover:bg-[var(--emerald)]/8"}`}
                    >
                      {busyId === profile.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : profile.accountStatus === "ACTIVE" ? (
                        <Ban className="h-4 w-4" />
                      ) : (
                        <UserRoundCheck className="h-4 w-4" />
                      )}
                      {profile.accountStatus === "ACTIVE"
                        ? "Bloquear acesso"
                        : "Reativar acesso"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busyId === profile.id}
                      onClick={() => void deleteProfile(profile)}
                      className="ml-auto h-9 rounded-lg text-xs font-bold text-[var(--ruby)] hover:bg-[var(--ruby)]/8 hover:text-[var(--ruby)]"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir usuário
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!isLoading && pagination.totalItems > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm sm:flex-row">
            <p className="text-black/55">
              Exibindo{" "}
              <strong className="text-black">
                {(pagination.page - 1) * pagination.pageSize + 1}–
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalItems,
                )}
              </strong>{" "}
              de <strong className="text-black">{pagination.totalItems}</strong>
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((current) => current - 1)}
                className="h-9 w-9 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-24 text-center text-xs font-bold">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="h-9 w-9 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

const PHOTOS_PER_SLIDE = 3;

function AdminProfilePhotoCarousel({
  profile,
  deletingPhotoId,
  onRemove,
}: {
  profile: AdminProfile;
  deletingPhotoId: string;
  onRemove: (profile: AdminProfile, photo: AdminPhoto) => Promise<void>;
}) {
  const [slide, setSlide] = useState(0);
  const slideCount = Math.max(
    1,
    Math.ceil(profile.photos.length / PHOTOS_PER_SLIDE),
  );
  const currentSlide = Math.min(slide, slideCount - 1);
  const firstPhotoIndex = currentSlide * PHOTOS_PER_SLIDE;
  const visiblePhotos = profile.photos.slice(
    firstPhotoIndex,
    firstPhotoIndex + PHOTOS_PER_SLIDE,
  );

  if (!profile.photos.length) {
    return (
      <div className="grid aspect-[4/1] place-items-center bg-[#eee8df] p-1 text-black/30">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <ImageOff className="h-4 w-4" /> Sem fotos
        </span>
      </div>
    );
  }

  return (
    <section
      className="bg-[#eee8df] p-1"
      aria-label={`Fotos de ${profile.username}`}
    >
      <div className="grid grid-cols-3 gap-1">
        {visiblePhotos.map((photo, index) => {
          const photoNumber = firstPhotoIndex + index + 1;

          return (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden bg-[#ddd5ca]"
            >
              <PhotoZoom
                src={`/api/admin/review-photos/${encodeURIComponent(photo.id)}`}
                thumbnailSrc={`/api/admin/review-photos/${encodeURIComponent(photo.id)}?variant=card&v=3`}
                alt={`Foto ${photoNumber} de ${profile.username}`}
                buttonClassName="absolute inset-0 block h-full w-full cursor-zoom-in"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent p-2 pt-7">
                <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  {photo.isPrivate ? "Privada" : "Pública"}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    photo.moderationStatus === "APPROVED"
                      ? "bg-emerald-100 text-emerald-900"
                      : photo.moderationStatus === "REJECTED"
                        ? "bg-red-100 text-red-900"
                        : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {photo.moderationStatus === "APPROVED"
                    ? "Aprovada"
                    : photo.moderationStatus === "REJECTED"
                      ? "Não aprovada"
                      : "Em análise"}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remover foto ${photoNumber}`}
                title="Remover foto"
                disabled={deletingPhotoId === photo.id}
                onClick={() => void onRemove(profile, photo)}
                className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-[var(--ruby)] text-white opacity-100 shadow-md transition hover:scale-105 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              >
                {deletingPhotoId === photo.id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {slideCount > 1 ? (
        <div className="flex min-h-10 items-center justify-between gap-3 px-2 py-1.5">
          <button
            type="button"
            aria-label="Ver fotos anteriores"
            disabled={currentSlide === 0}
            onClick={() => setSlide((current) => Math.max(0, current - 1))}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-black/65 shadow-sm transition hover:bg-[var(--gold)] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-black/48">
              Fotos {firstPhotoIndex + 1}–
              {Math.min(
                firstPhotoIndex + PHOTOS_PER_SLIDE,
                profile.photos.length,
              )}{" "}
              de {profile.photos.length}
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: slideCount }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-5 bg-[var(--gold)]"
                      : "w-1.5 bg-black/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Ver próximas fotos"
            disabled={currentSlide === slideCount - 1}
            onClick={() =>
              setSlide((current) => Math.min(slideCount - 1, current + 1))
            }
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-black/65 shadow-sm transition hover:bg-[var(--gold)] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-black/10 bg-[#fbfaf7] px-3 text-sm font-medium outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/15"
      >
        {children}
      </select>
    </label>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof UsersRound;
  tone: "gold" | "ruby" | "emerald" | "black" | "violet" | "amber";
}) {
  const colors = {
    gold: "bg-[var(--gold)]/12 text-[var(--gold)]",
    ruby: "bg-[var(--ruby)]/10 text-[var(--ruby)]",
    emerald: "bg-[var(--emerald)]/10 text-[var(--emerald)]",
    black: "bg-black/7 text-black/65",
    violet: "bg-violet-100 text-violet-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-black/8 bg-white p-4 shadow-[0_8px_25px_rgba(36,21,13,0.04)]">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${colors[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <strong className="block text-2xl leading-none">
          {value?.toLocaleString("pt-BR")}
        </strong>
        <span className="mt-1 block text-xs font-medium text-black/48">
          {label}
        </span>
      </div>
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "ruby" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    gold: "bg-[var(--gold)]/12 text-[var(--cognac)]",
    ruby: "bg-[var(--ruby)]/10 text-[var(--ruby)]",
    emerald: "bg-[var(--emerald)]/10 text-[var(--emerald)]",
    violet: "bg-violet-100 text-violet-900",
    amber: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${colors[tone]}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${active ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "bg-[var(--ruby)]/10 text-[var(--ruby)]"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--emerald)]" : "bg-[var(--ruby)]"}`}
      />
      {active ? "Ativa" : status === "BANNED" ? "Bloqueada" : "Suspensa"}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[9px] font-extrabold uppercase tracking-[0.1em] text-black/35">
        {label}
      </span>
      <span
        className="mt-1 block truncate font-bold text-black/72"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function roleLabel(role: string | null) {
  return role === "SUGAR_BABY"
    ? "Sugar Baby"
    : role === "SUGAR_DADDY"
      ? "Sugar Daddy"
      : "—";
}

function genderLabel(value: string | null) {
  const labels: Record<string, string> = {
    "sugar-daddy": "Homem",
    "sugar-mommy": "Mulher",
    "sugar-baby-woman": "Mulher",
    "sugar-baby-trans-woman": "Mulher trans",
    "sugar-baby-man": "Homem",
    "sugar-baby-trans-man": "Homem trans",
  };

  if (!value?.trim()) return "Não informado";
  return labels[value.trim().toLowerCase()] ?? value;
}

function approvalLabel(status: string) {
  return (
    {
      PENDING: "Pendente",
      WAITING: "Em espera",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
    }[status] ?? status
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeDate(value: string | null) {
  if (!value) return "nunca";
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return formatDate(value);
}

function filenameFromResponse(response: Response) {
  const disposition = response.headers.get("content-disposition");
  return disposition?.match(/filename="([^"]+)"/)?.[1];
}
