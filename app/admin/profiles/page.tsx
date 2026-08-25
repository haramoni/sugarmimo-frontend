"use client";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  ImageOff,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
};

type AdminProfile = {
  id: string;
  username: string;
  email: string;
  role: string | null;
  city: string | null;
  state: string | null;
  approvalStatus: string;
  accountStatus: string;
  suspendedUntil: string | null;
  isPremium: boolean;
  isPremiere: boolean;
  isAdminFeatured: boolean;
  boostCredits: number;
  lastActiveAt: string | null;
  createdAt: string | null;
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

type Stats = { total: number; babies: number; daddies: number; restricted: number };

const PAGE_SIZE = 12;

export default function AdminProfilesPage() {
  const router = useRouter();
  const latestRequestId = useRef(0);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, babies: 0, daddies: 0, restricted: 0 });
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
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (approvalStatus) params.set("approvalStatus", approvalStatus);
      if (accountStatus) params.set("accountStatus", accountStatus);

      const response = await fetch(`/api/admin/profiles?${params.toString()}`);
      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Não foi possível carregar os perfis.");
      if (requestId !== latestRequestId.current) return;

      setProfiles(result.items ?? []);
      setStats(result.stats ?? { total: 0, babies: 0, daddies: 0, restricted: 0 });
      setPagination(result.pagination);
      if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
        setPage(result.pagination.totalPages);
      }
    } catch (loadError) {
      if (requestId === latestRequestId.current) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os perfis.");
      }
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, [accountStatus, approvalStatus, page, role, router, search]);

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
        throw new Error(result?.message ?? "Não foi possível exportar os perfis.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filenameFromResponse(response) ?? "usuarios-sugarmimo.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Não foi possível exportar os perfis.");
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
        : `${profile.username} perderá o acesso imediatamente, mas os dados serão preservados.`,
      icon: activating ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: activating ? "Sim, reativar" : "Sim, bloquear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: activating ? "var(--emerald)" : "var(--ruby)",
    });
    if (!confirmation.isConfirmed) return;

    setBusyId(profile.id);
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/${activating ? "activate" : "ban"}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Não foi possível alterar o acesso.");
      await loadProfiles();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível alterar o acesso.");
    } finally {
      setBusyId("");
    }
  }

  async function approveProfile(profile: AdminProfile) {
    setBusyId(profile.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/profiles/${encodeURIComponent(profile.id)}/approve`, {
        method: "PATCH",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Não foi possível aprovar o perfil.");
      await loadProfiles();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível aprovar o perfil.");
    } finally {
      setBusyId("");
    }
  }

  async function removePhoto(profile: AdminProfile, photo: AdminPhoto) {
    const confirmation = await Swal.fire({
      title: "Remover esta foto?",
      text: `A imagem será excluída permanentemente do perfil de ${profile.username}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover foto",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--ruby)",
    });
    if (!confirmation.isConfirmed) return;

    setDeletingPhotoId(photo.id);
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/photos/${encodeURIComponent(photo.id)}`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Não foi possível remover a foto.");
      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? { ...item, photos: item.photos.filter((itemPhoto) => itemPhoto.id !== photo.id) }
            : item,
        ),
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível remover a foto.");
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
      const response = await fetch(`/api/admin/profiles/${encodeURIComponent(profile.id)}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Não foi possível excluir o perfil.");
      if (profiles.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadProfiles();
      await Swal.fire({ title: "Perfil excluído", text: `${profile.username} foi removido.`, icon: "success" });
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível excluir o perfil.");
    } finally {
      setBusyId("");
    }
  }

  const hasFilters = Boolean(search || role || approvalStatus || accountStatus);

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-4 pb-12 pt-20 text-[var(--black)] sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <UsersRound className="h-5 w-5" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Comunidade</span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Gerenciar perfis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              Consulte toda a base, modere fotos e controle o acesso de cada usuário.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start xl:self-auto">
            <Button
              type="button"
              onClick={() => void exportCsv()}
              disabled={isExporting}
              className="h-11 rounded-lg bg-[var(--emerald)] font-bold text-white hover:bg-[var(--emerald)]/90"
            >
              {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProfiles()}
              disabled={isLoading}
              className="h-11 rounded-lg border-black/10 bg-white font-bold"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar dados
            </Button>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo dos perfis">
          <StatCard label="Perfis cadastrados" value={stats.total} icon={UsersRound} tone="gold" />
          <StatCard label="Sugar Babies" value={stats.babies} icon={Sparkles} tone="ruby" />
          <StatCard label="Sugar Daddies" value={stats.daddies} icon={Crown} tone="emerald" />
          <StatCard label="Acesso restrito" value={stats.restricted} icon={Ban} tone="black" />
        </section>

        <form
          onSubmit={submitSearch}
          className="grid gap-3 rounded-xl border border-black/8 bg-white p-4 shadow-[0_12px_35px_rgba(36,21,13,0.05)] md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_190px_190px_auto]"
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
          <FilterSelect label="Tipo de perfil" value={role} onChange={(value) => { setRole(value); setPage(1); }}>
            <option value="">Todos os tipos</option>
            <option value="SUGAR_BABY">Sugar Baby</option>
            <option value="SUGAR_DADDY">Sugar Daddy</option>
          </FilterSelect>
          <FilterSelect label="Status de aprovação" value={approvalStatus} onChange={(value) => { setApprovalStatus(value); setPage(1); }}>
            <option value="">Todas aprovações</option>
            <option value="PENDING">Pendente</option>
            <option value="WAITING">Em espera</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
          </FilterSelect>
          <FilterSelect label="Status da conta" value={accountStatus} onChange={(value) => { setAccountStatus(value); setPage(1); }}>
            <option value="">Todas as contas</option>
            <option value="ACTIVE">Ativa</option>
            <option value="SUSPENDED">Suspensa</option>
            <option value="BANNED">Bloqueada</option>
          </FilterSelect>
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1 rounded-lg bg-[var(--gold)] font-bold text-white hover:bg-[var(--cognac)]">
              Buscar
            </Button>
            {hasFilters ? (
              <Button type="button" variant="ghost" size="icon" title="Limpar filtros" onClick={clearFilters} className="h-11 w-11 rounded-lg">
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
              <p className="mt-1 text-sm text-black/50">Tente alterar a busca ou limpar os filtros.</p>
            </div>
          </div>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2" aria-label="Lista de perfis">
            {profiles.map((profile) => (
              <article key={profile.id} className="overflow-hidden rounded-xl border border-black/8 bg-white shadow-[0_12px_35px_rgba(36,21,13,0.06)]">
                <div className="grid grid-cols-3 gap-1 bg-[#eee8df] p-1">
                  {profile.photos.length ? (
                    profile.photos.slice(0, 3).map((photo, index) => (
                      <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden bg-[#ddd5ca]">
                        <PhotoZoom
                          src={`/api/admin/review-photos/${encodeURIComponent(photo.id)}`}
                          thumbnailSrc={`/api/admin/review-photos/${encodeURIComponent(photo.id)}?variant=card`}
                          alt={`Foto ${index + 1} de ${profile.username}`}
                          buttonClassName="absolute inset-0 block h-full w-full cursor-zoom-in"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent p-2 pt-7">
                          {photo.isPrivate ? <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Privada</span> : <span />}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remover foto ${index + 1}`}
                          title="Remover foto"
                          disabled={deletingPhotoId === photo.id}
                          onClick={() => void removePhoto(profile, photo)}
                          className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-[var(--ruby)] text-white opacity-100 shadow-md transition hover:scale-105 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        >
                          {deletingPhotoId === photo.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 grid aspect-[4/1] place-items-center text-black/30">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"><ImageOff className="h-4 w-4" /> Sem fotos</span>
                    </div>
                  )}
                  {profile.photos.length > 3 ? (
                    <span className="absolute sr-only">{profile.photos.length - 3} fotos adicionais</span>
                  ) : null}
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-xl font-bold">{profile.username}</h2>
                        {profile.isPremiere ? <Badge label="Premiere" tone="gold" /> : null}
                        {profile.isPremium ? <Badge label="Premium" tone="emerald" /> : null}
                        {profile.isAdminFeatured ? <Badge label="Destaque" tone="ruby" /> : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-black/50">{profile.email}</p>
                    </div>
                    <StatusBadge status={profile.accountStatus} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#faf7f1] p-3 text-xs sm:grid-cols-4">
                    <Info label="Perfil" value={roleLabel(profile.role)} />
                    <Info label="Aprovação" value={approvalLabel(profile.approvalStatus)} />
                    <Info label="Fotos" value={String(profile.photos.length)} />
                    <Info label="Cadastro" value={formatDate(profile.createdAt)} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-black/48">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {[profile.city, profile.state].filter(Boolean).join(", ") || "Local não informado"}</span>
                    <span>Última atividade: {formatRelativeDate(profile.lastActiveAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-black/8 pt-4">
                    {profile.role === "SUGAR_BABY" && ["PENDING", "WAITING", "REJECTED"].includes(profile.approvalStatus) ? (
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyId === profile.id}
                      onClick={() => void updateAccount(profile)}
                      className={`h-9 rounded-lg text-xs font-bold ${profile.accountStatus === "ACTIVE" ? "border-[var(--ruby)]/25 text-[var(--ruby)] hover:bg-[var(--ruby)]/8" : "border-[var(--emerald)]/25 text-[var(--emerald)] hover:bg-[var(--emerald)]/8"}`}
                    >
                      {busyId === profile.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : profile.accountStatus === "ACTIVE" ? <Ban className="h-4 w-4" /> : <UserRoundCheck className="h-4 w-4" />}
                      {profile.accountStatus === "ACTIVE" ? "Bloquear acesso" : "Reativar acesso"}
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
              Exibindo <strong className="text-black">{(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}</strong> de <strong className="text-black">{pagination.totalItems}</strong>
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" disabled={!pagination.hasPreviousPage} onClick={() => setPage((current) => current - 1)} className="h-9 w-9 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-24 text-center text-xs font-bold">Página {pagination.page} de {Math.max(1, pagination.totalPages)}</span>
              <Button type="button" variant="outline" size="icon" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="h-9 w-9 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-black/10 bg-[#fbfaf7] px-3 text-sm font-medium outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/15">
        {children}
      </select>
    </label>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof UsersRound; tone: "gold" | "ruby" | "emerald" | "black" }) {
  const colors = {
    gold: "bg-[var(--gold)]/12 text-[var(--gold)]",
    ruby: "bg-[var(--ruby)]/10 text-[var(--ruby)]",
    emerald: "bg-[var(--emerald)]/10 text-[var(--emerald)]",
    black: "bg-black/7 text-black/65",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-black/8 bg-white p-4 shadow-[0_8px_25px_rgba(36,21,13,0.04)]">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${colors[tone]}`}><Icon className="h-5 w-5" /></span>
      <div><strong className="block text-2xl leading-none">{value.toLocaleString("pt-BR")}</strong><span className="mt-1 block text-xs font-medium text-black/48">{label}</span></div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "gold" | "ruby" | "emerald" }) {
  const colors = { gold: "bg-[var(--gold)]/12 text-[var(--cognac)]", ruby: "bg-[var(--ruby)]/10 text-[var(--ruby)]", emerald: "bg-[var(--emerald)]/10 text-[var(--emerald)]" };
  return <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${colors[tone]}`}>{label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${active ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "bg-[var(--ruby)]/10 text-[var(--ruby)]"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--emerald)]" : "bg-[var(--ruby)]"}`} />{active ? "Ativa" : status === "BANNED" ? "Bloqueada" : "Suspensa"}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[9px] font-extrabold uppercase tracking-[0.1em] text-black/35">{label}</span><span className="mt-1 block truncate font-bold text-black/72" title={value}>{value}</span></div>;
}

function roleLabel(role: string | null) {
  return role === "SUGAR_BABY" ? "Sugar Baby" : role === "SUGAR_DADDY" ? "Sugar Daddy" : "—";
}

function approvalLabel(status: string) {
  return { PENDING: "Pendente", WAITING: "Em espera", APPROVED: "Aprovado", REJECTED: "Rejeitado" }[status] ?? status;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
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
