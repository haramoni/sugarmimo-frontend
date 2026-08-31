"use client";

import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImageOff,
  Images,
  LoaderCircle,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
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
import { profileIdentityLabel } from "@/app/lib/profileIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

type ModerationPhoto = {
  id: string;
  fileName: string | null;
  mimeType: string | null;
  sortOrder: number;
  isPrivate: boolean;
  moderationStatus: ModerationStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatedById: string | null;
  replacesPhotoId: string | null;
  createdAt: string | null;
};

type ModerationProfile = {
  id: string;
  username: string;
  email: string;
  role: string | null;
  gender: string | null;
  age: number | null;
  approvalStatus: string;
  accountStatus: string;
  city: string | null;
  state: string | null;
  createdAt: string | null;
  photos: ModerationPhoto[];
};

type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Stats = { pending: number; approved: number; rejected: number };

const PAGE_SIZE = 8;
const statusOptions: Array<{
  value: ModerationStatus;
  label: string;
  icon: typeof Clock3;
  stat: keyof Stats;
}> = [
  {
    value: "PENDING",
    label: "Aguardando análise",
    icon: Clock3,
    stat: "pending",
  },
  {
    value: "APPROVED",
    label: "Aprovadas",
    icon: ShieldCheck,
    stat: "approved",
  },
  {
    value: "REJECTED",
    label: "Não aprovadas",
    icon: ShieldAlert,
    stat: "rejected",
  },
];

export default function PhotoModerationPage() {
  const router = useRouter();
  const latestRequestId = useRef(0);
  const [profiles, setProfiles] = useState<ModerationProfile[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [status, setStatus] = useState<ModerationStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyPhotoId, setBusyPhotoId] = useState("");
  const [busyProfileId, setBusyProfileId] = useState("");
  const [busyApproveAllProfileId, setBusyApproveAllProfileId] = useState("");
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        status,
      });
      if (search) params.set("search", search);

      const response = await fetch(
        `/api/admin/photo-moderation?${params.toString()}`,
      );
      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível carregar a moderação de fotos.",
        );
      }
      if (requestId !== latestRequestId.current) return;

      setProfiles(result?.items ?? []);
      setStats(result?.stats ?? { pending: 0, approved: 0, rejected: 0 });
      setPagination(
        result?.pagination ?? {
          page: 1,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      );
    } catch (loadError) {
      if (requestId === latestRequestId.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar a moderação de fotos.",
        );
      }
    } finally {
      if (requestId === latestRequestId.current) setIsLoading(false);
    }
  }, [page, router, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadQueue(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadQueue]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  async function reviewPhoto(
    profile: ModerationProfile,
    photo: ModerationPhoto,
    action: "approve" | "reject",
  ) {
    let reason = "";
    if (action === "reject") {
      const prompt = await Swal.fire({
        title: "Não aprovar esta foto?",
        text: `O motivo será mostrado a ${profile.username} no próximo acesso.`,
        icon: "warning",
        input: "textarea",
        inputLabel: "Motivo da decisão",
        inputPlaceholder:
          "Explique objetivamente qual regra a imagem não atende...",
        inputAttributes: {
          maxlength: "1000",
          "aria-label": "Motivo da rejeição",
        },
        showCancelButton: true,
        confirmButtonText: "Enviar motivo e rejeitar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#9f1239",
        preConfirm: (value) => {
          const normalized = String(value ?? "").trim();
          if (normalized.length < 8) {
            Swal.showValidationMessage(
              "Informe um motivo claro com pelo menos 8 caracteres.",
            );
            return false;
          }
          return normalized;
        },
      });
      if (!prompt.isConfirmed || !prompt.value) return;
      reason = String(prompt.value);
    }

    setBusyPhotoId(photo.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/photo-moderation/${encodeURIComponent(photo.id)}/${action}`,
        {
          method: "PATCH",
          headers:
            action === "reject"
              ? { "Content-Type": "application/json" }
              : undefined,
          body: action === "reject" ? JSON.stringify({ reason }) : undefined,
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.message ?? "Não foi possível revisar a foto.");

      const nextStatus: ModerationStatus =
        action === "approve" ? "APPROVED" : "REJECTED";
      setProfiles((currentProfiles) =>
        currentProfiles.map((currentProfile) => {
          if (currentProfile.id !== profile.id) return currentProfile;

          return {
            ...currentProfile,
            photos: currentProfile.photos
              .filter(
                (currentPhoto) =>
                  action !== "approve" ||
                  !photo.replacesPhotoId ||
                  currentPhoto.id !== photo.replacesPhotoId,
              )
              .map((currentPhoto) =>
                currentPhoto.id === photo.id
                  ? {
                      ...currentPhoto,
                      moderationStatus: nextStatus,
                      moderationReason:
                        action === "reject"
                          ? (result?.moderationReason ?? reason)
                          : null,
                      moderatedAt:
                        result?.moderatedAt ?? new Date().toISOString(),
                      replacesPhotoId:
                        action === "approve"
                          ? null
                          : currentPhoto.replacesPhotoId,
                    }
                  : currentPhoto,
              ),
          };
        }),
      );
      setStats((currentStats) => ({
        ...currentStats,
        pending: Math.max(0, currentStats.pending - 1),
        approved: currentStats.approved + (action === "approve" ? 1 : 0),
        rejected: currentStats.rejected + (action === "reject" ? 1 : 0),
      }));

      void Swal.fire({
        toast: true,
        position: "top-end",
        title: action === "approve" ? "Foto aprovada" : "Foto não aprovada",
        text:
          action === "approve"
            ? "Você já pode continuar avaliando as próximas fotos."
            : "A pessoa receberá o motivo informado.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Não foi possível revisar a foto.",
      );
    } finally {
      setBusyPhotoId("");
    }
  }

  async function blockProfile(profile: ModerationProfile) {
    const prompt = await Swal.fire({
      title: `Bloquear @${profile.username}?`,
      text: "O acesso à conta será impedido imediatamente e o motivo aparecerá no login.",
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo do bloqueio",
      inputPlaceholder: "Descreva a violação que motivou o bloqueio...",
      inputAttributes: {
        maxlength: "1000",
        "aria-label": "Motivo do bloqueio",
      },
      showCancelButton: true,
      confirmButtonText: "Bloquear acesso",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#9f1239",
      preConfirm: (value) => {
        const normalized = String(value ?? "").trim();
        if (normalized.length < 8) {
          Swal.showValidationMessage(
            "Informe um motivo claro com pelo menos 8 caracteres.",
          );
          return false;
        }
        return normalized;
      },
    });
    if (!prompt.isConfirmed || !prompt.value) return;

    setBusyProfileId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/ban`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: String(prompt.value) }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.message ?? "Não foi possível bloquear o perfil.",
        );

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id ? { ...item, accountStatus: "BANNED" } : item,
        ),
      );
      await Swal.fire({
        title: "Acesso bloqueado",
        text: `@${profile.username} verá o motivo ao tentar entrar.`,
        icon: "success",
      });
    } catch (blockError) {
      setError(
        blockError instanceof Error
          ? blockError.message
          : "Não foi possível bloquear o perfil.",
      );
    } finally {
      setBusyProfileId("");
    }
  }

  async function approveAllPhotos(profile: ModerationProfile) {
    const pendingPhotos = profile.photos.filter(
      (photo) => photo.moderationStatus === "PENDING",
    );
    const pendingCount = pendingPhotos.length;
    if (pendingCount === 0) return;

    const confirmation = await Swal.fire({
      title: `Aceitar todas as fotos de @${profile.username}?`,
      text: `${pendingCount} foto(s) pendente(s) serão aprovadas de uma só vez.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, aceitar todas",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#047857",
    });
    if (!confirmation.isConfirmed) return;

    setBusyApproveAllProfileId(profile.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/photo-moderation/user/${encodeURIComponent(profile.id)}/approve-all`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoIds: pendingPhotos.map((photo) => photo.id),
          }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível aceitar todas as fotos.",
        );
      }

      await loadQueue();
      void Swal.fire({
        toast: true,
        position: "top-end",
        title: "Todas as fotos foram aceitas",
        text: `${result?.approvedCount ?? pendingCount} foto(s) aprovada(s).`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "Não foi possível aceitar todas as fotos.",
      );
    } finally {
      setBusyApproveAllProfileId("");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] px-4 py-8 text-[var(--espresso)] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="overflow-hidden rounded-3xl bg-[var(--espresso)] px-6 py-7 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
                <Images className="h-4 w-4" /> Moderação obrigatória
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Validação de fotos
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/66 sm:text-base">
                Toda imagem nova, privada ou pública, permanece invisível aos
                demais usuários até ser aprovada. A galeria completa de cada
                perfil aparece abaixo para dar contexto à decisão.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadQueue()}
              disabled={isLoading}
              className="border-white/20 bg-white/8 text-white hover:bg-white/15 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />{" "}
              Atualizar fila
            </Button>
          </div>
        </header>

        <section
          className="grid gap-3 md:grid-cols-3"
          aria-label="Estados da moderação"
        >
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const active = status === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={`flex min-h-24 items-center justify-between rounded-2xl border p-5 text-left shadow-sm transition ${
                  active
                    ? "border-[var(--gold)] bg-[var(--espresso)] text-white"
                    : "border-black/8 bg-white hover:border-[var(--gold)]"
                }`}
                aria-pressed={active}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-white/10" : "bg-[var(--gold)]/12"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-extrabold">{option.label}</span>
                </span>
                <strong className="text-2xl font-black">
                  {stats[option.stat]}
                </strong>
              </button>
            );
          })}
        </section>

        <form
          onSubmit={submitSearch}
          className="flex gap-2 rounded-2xl border border-black/8 bg-white p-3 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Buscar por usuário ou e-mail"
              className="h-11 rounded-xl border-black/10 pl-10"
            />
          </div>
          <Button
            type="submit"
            className="h-11 rounded-xl bg-[var(--espresso)] px-6 text-white hover:bg-[var(--gold)]"
          >
            Buscar
          </Button>
        </form>

        {error ? (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            <ShieldAlert className="h-5 w-5 shrink-0" /> {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center rounded-3xl border border-black/8 bg-white">
            <span className="flex items-center gap-3 text-sm font-bold text-black/50">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Carregando
              galerias...
            </span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-black/15 bg-white p-8 text-center">
            <div>
              <ImageOff className="mx-auto h-10 w-10 text-black/25" />
              <p className="mt-4 font-extrabold">Nenhuma foto neste estado</p>
              <p className="mt-1 text-sm text-black/50">
                A fila será atualizada quando houver novos envios.
              </p>
            </div>
          </div>
        ) : (
          <section
            className="space-y-5"
            aria-label="Perfis com fotos para moderação"
          >
            {profiles.map((profile) => {
              const pendingPhotoCount = profile.photos.filter(
                (photo) => photo.moderationStatus === "PENDING",
              ).length;

              return (
                <article
                  key={profile.id}
                  className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-black/8 bg-[#fcfaf6] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--espresso)] text-white">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-black">
                            @{profile.username}
                          </h2>
                          <span className="rounded-full bg-black/6 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide">
                            {profileIdentityLabel(profile.role, profile.gender)}
                          </span>
                          <span className="rounded-full bg-[var(--gold)]/12 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--cognac)]">
                            Gênero: {genderLabel(profile.gender)}
                          </span>
                          <span className="rounded-full bg-[var(--emerald)]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--emerald)]">
                            Idade:{" "}
                            {profile.age === null
                              ? "Não informada"
                              : `${profile.age} anos`}
                          </span>
                          {profile.accountStatus === "BANNED" ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-red-800">
                              Bloqueado
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-black/48">
                          {profile.email} ·{" "}
                          {[profile.city, profile.state]
                            .filter(Boolean)
                            .join(" / ") || "Local não informado"}{" "}
                          · {profile.photos.length} foto(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {pendingPhotoCount > 0 ? (
                        <Button
                          type="button"
                          onClick={() => void approveAllPhotos(profile)}
                          disabled={Boolean(
                            busyPhotoId ||
                            busyApproveAllProfileId ||
                            busyProfileId,
                          )}
                          className="bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                          {busyApproveAllProfileId === profile.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Aceitar todas ({pendingPhotoCount})
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          profile.accountStatus === "BANNED" ||
                          Boolean(busyProfileId || busyApproveAllProfileId)
                        }
                        onClick={() => void blockProfile(profile)}
                        className="border-red-200 text-red-800 hover:bg-red-50 hover:text-red-900"
                      >
                        {busyProfileId === profile.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                        {profile.accountStatus === "BANNED"
                          ? "Acesso bloqueado"
                          : "Bloquear acesso"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {profile.photos.map((photo, index) => {
                      const isPending = photo.moderationStatus === "PENDING";
                      return (
                        <div
                          key={photo.id}
                          className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e3d9]">
                            <PhotoZoom
                              src={`/api/admin/review-photos/${encodeURIComponent(photo.id)}`}
                              thumbnailSrc={`/api/admin/review-photos/${encodeURIComponent(photo.id)}?variant=card&v=3`}
                              alt={`Foto ${index + 1} de ${profile.username}`}
                              imageClassName="h-full w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/65 to-transparent p-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-extrabold uppercase text-white backdrop-blur-sm">
                                {photo.isPrivate ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  <Images className="h-3 w-3" />
                                )}
                                {photo.isPrivate ? "Privada" : "Pública"}
                              </span>
                              <StatusBadge status={photo.moderationStatus} />
                            </div>
                            {photo.replacesPhotoId ? (
                              <span className="absolute bottom-3 left-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow">
                                Troca de foto
                              </span>
                            ) : null}
                          </div>
                          <div className="space-y-3 p-3.5">
                            <div>
                              <p className="truncate text-xs font-extrabold">
                                {photo.fileName || `Foto ${index + 1}`}
                              </p>
                              <p className="mt-1 text-[11px] text-black/45">
                                Enviada em {formatDateTime(photo.createdAt)}
                              </p>
                            </div>
                            {photo.moderationReason ? (
                              <p className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold leading-5 text-red-800">
                                {photo.moderationReason}
                              </p>
                            ) : null}
                            {isPending ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    void reviewPhoto(profile, photo, "approve")
                                  }
                                  disabled={Boolean(
                                    busyPhotoId || busyApproveAllProfileId,
                                  )}
                                  className="bg-emerald-700 text-white hover:bg-emerald-800"
                                >
                                  {busyPhotoId === photo.id ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}{" "}
                                  Aprovar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    void reviewPhoto(profile, photo, "reject")
                                  }
                                  disabled={Boolean(
                                    busyPhotoId || busyApproveAllProfileId,
                                  )}
                                  className="border-red-200 text-red-800 hover:bg-red-50 hover:text-red-900"
                                >
                                  <X className="h-4 w-4" /> Não aprovar
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {pagination.totalPages > 1 ? (
          <nav
            className="flex items-center justify-between rounded-2xl border border-black/8 bg-white p-3"
            aria-label="Paginação da moderação de fotos"
          >
            <Button
              type="button"
              variant="outline"
              disabled={!pagination.hasPreviousPage || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span className="text-xs font-bold text-black/55">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        ) : null}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: ModerationStatus }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-900",
    APPROVED: "bg-emerald-100 text-emerald-900",
    REJECTED: "bg-red-100 text-red-900",
  }[status];
  const labels = {
    PENDING: "Em análise",
    APPROVED: "Aprovada",
    REJECTED: "Não aprovada",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${styles}`}
    >
      {labels[status]}
    </span>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function genderLabel(value: string | null) {
  const labels: Record<string, string> = {
    "sugar-daddy": "Homem",
    "sugar-mommy": "Mulher",
    "sugar-baby-woman": "Mulher",
    "sugar-baby-trans-woman": "Mulher trans",
    "sugar-baby-man": "Homem",
    "sugar-baby-trans-man": "Homem trans",
    "sugar-baby-lgbtqia": "LGBTQIA+",
    "sugar-provider-lgbtqia": "LGBTQIA+",
  };

  if (!value?.trim()) return "Não informado";
  return labels[value.trim().toLowerCase()] ?? value;
}
