"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ClipboardList,
  Crown,
  Hourglass,
  KeyRound,
  LogOut,
  RefreshCw,
  RotateCcw,
  Rocket,
  Search,
  Star,
  Trash2,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { PhotoZoom } from "@/app/components/ui/PhotoZoom";

type PendingPhoto = {
  id: string;
  fileName: string | null;
  mimeType: string | null;
  sortOrder: number;
};

type PendingProfile = {
  id: string;
  username: string;
  email: string;
  accountPhone: string | null;
  role: string | null;
  gender: string | null;
  lookingFor: string | null;
  birthDate: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  whatsapp: string | null;
  telegram: string | null;
  instagram: string | null;
  approvalStatus: string;
  reapplicationCount: number;
  reapplicationPin: string | null;
  reappliedAt: string | null;
  reapplicationModerationAction: string | null;
  reapplicationModerationReason: string | null;
  isApprovalPriority: boolean;
  approvalPriorityPaidAt: string | null;
  createdAt: string | null;
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
  photos: PendingPhoto[];
};

type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const PAGE_SIZE = 6;

function AdminReviewQueue({ queue }: { queue: "pending" | "waiting" }) {
  const router = useRouter();
  const isWaitingQueue = queue === "waiting";
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [prioritizingId, setPrioritizingId] = useState("");
  const [deletingPhotoId, setDeletingPhotoId] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const latestRequestId = useRef(0);

  const loadProfiles = useCallback(
    async (requestedPage: number) => {
      const requestId = ++latestRequestId.current;
      setError("");
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(requestedPage),
          pageSize: String(PAGE_SIZE),
        });
        if (search) {
          params.set("search", search);
        }
        const response = await fetch(
          `/api/admin/${isWaitingQueue ? "waiting-babies" : "pending-babies"}?${params.toString()}`,
        );

        if (response.status === 401 || response.status === 403) {
          router.push("/admin/login");
          return;
        }

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ?? "Não foi possível carregar perfis.",
          );
        }

        if (requestId !== latestRequestId.current) {
          return;
        }

        setProfiles(result.items);
        setPagination(result.pagination);

        if (
          result.pagination?.totalPages > 0 &&
          requestedPage > result.pagination?.totalPages
        ) {
          setPage(result.pagination?.totalPages);
        }
      } catch (loadError) {
        if (requestId !== latestRequestId.current) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar perfis.",
        );
      } finally {
        if (requestId === latestRequestId.current) {
          setIsLoading(false);
        }
      }
    },
    [isWaitingQueue, router, search],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(page), 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles, page]);

  async function reviewProfile(
    id: string,
    action: "approve" | "reject" | "wait",
  ) {
    let rejectionReason = "";
    if (action === "reject") {
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

      if (!confirmation.isConfirmed) {
        return;
      }
      rejectionReason = String(confirmation.value);
    }

    setReviewingId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/profiles/${id}/${action}`, {
        method: "PATCH",
        ...(action === "reject"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason: rejectionReason }),
            }
          : {}),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível revisar o perfil.",
        );
      }

      if (profiles?.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await loadProfiles(page);
      }
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Não foi possível revisar o perfil.",
      );
    } finally {
      setReviewingId("");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  async function updatePriority(profile: PendingProfile) {
    if (!profile.isApprovalPriority) {
      const confirmation = await Swal.fire({
        title: "Confirmar prioridade paga?",
        text: `Confirme somente após verificar o PIX de R$ 30,00 enviado por ${profile.username}.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "PIX confirmado",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "var(--gold)",
      });

      if (!confirmation.isConfirmed) {
        return;
      }
    }

    setPrioritizingId(profile.id);
    setError("");

    try {
      const action = profile.isApprovalPriority
        ? "standard-priority"
        : "priority";
      const response = await fetch(
        `/api/admin/profiles/${encodeURIComponent(profile.id)}/${action}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível alterar a prioridade.",
        );
      }

      await loadProfiles(page);
    } catch (priorityError) {
      setError(
        priorityError instanceof Error
          ? priorityError.message
          : "Não foi possível alterar a prioridade.",
      );
    } finally {
      setPrioritizingId("");
    }
  }

  async function removePhoto(profile: PendingProfile, photo: PendingPhoto) {
    const confirmation = await Swal.fire({
      title: "Remover esta foto?",
      text: `A foto será excluída permanentemente do perfil de ${profile.username}. O motivo será exibido no próximo login.`,
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo da remoção",
      inputPlaceholder: "Explique qual regra ou diretriz a foto não atende...",
      inputAttributes: { maxlength: "1000" },
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
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

    if (!confirmation.isConfirmed) {
      return;
    }

    setDeletingPhotoId(photo.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/profiles/${profile.id}/photos/${photo.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: confirmation.value }),
        },
      );
      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível remover a foto.");
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((currentProfile) =>
          currentProfile.id === profile.id
            ? {
                ...currentProfile,
                photos: currentProfile.photos.filter(
                  (currentPhoto) => currentPhoto.id !== photo.id,
                ),
              }
            : currentProfile,
        ),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível remover a foto.",
      );
    } finally {
      setDeletingPhotoId("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--black)]">
      <header className="border-b border-[var(--platinum)] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Image
            src="/sm-image.png"
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
              aria-label="Gerenciar Boosts"
              title="Gerenciar Boosts"
              onClick={() => router.push("/admin/boosts")}
              className="rounded-sm"
            >
              <Rocket className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Impulsionar Sugar Babies"
              title="Impulsionar Sugar Babies"
              onClick={() => router.push("/admin/featured")}
              className="rounded-sm"
            >
              <Star className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isWaitingQueue
                  ? "Voltar para perfis pendentes"
                  : "Ver perfis aguardando"
              }
              title={isWaitingQueue ? "Perfis pendentes" : "Perfis aguardando"}
              onClick={() =>
                router.push(
                  isWaitingQueue ? "/admin/approvals" : "/admin/waiting",
                )
              }
              className="rounded-sm"
            >
              <Hourglass className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Gerenciar Premium"
              onClick={() => router.push("/admin/premium")}
              className="rounded-sm"
            >
              <Crown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Ver logs"
              onClick={() => router.push("/admin/activity-logs")}
              className="rounded-sm"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atualizar lista"
              disabled={isLoading}
              onClick={() => void loadProfiles(page)}
              className="rounded-sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={logout}
              className="rounded-sm"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-5 px-5 py-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isWaitingQueue ? "Aguardando" : "Aprovar Babies"}
            </h1>
            <p className="text-sm text-[color:color-mix(in_srgb,var(--black)_62%,transparent)]">
              {isWaitingQueue
                ? "Perfis separados para uma decisão posterior."
                : "Perfis aguardando avaliação manual."}
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--gold)]">
            {pagination?.totalItems}{" "}
            {isWaitingQueue ? "aguardando" : "pendente(s)"}
          </span>
        </div>

        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 border border-[var(--platinum)] bg-white p-3 shadow-[0_8px_24px_rgba(20,17,14,0.05)]"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Buscar por username ou e-mail"
              className="h-11 rounded-sm border-[var(--platinum)] pl-9 pr-9"
            />
            {searchDraft ? (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-black/45 hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Button
            type="submit"
            className="h-11 rounded-sm bg-[var(--gold)] font-bold text-white hover:bg-[color:color-mix(in_srgb,var(--gold)_86%,black)]"
          >
            Buscar
          </Button>
        </form>

        {error && (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="border border-[var(--platinum)] bg-white">
            <LoadingSpinner label="Carregando perfis..." />
          </div>
        ) : profiles?.length === 0 ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            {search
              ? `Nenhum perfil encontrado para “${search}”.`
              : isWaitingQueue
                ? "Nenhum perfil na fila de espera."
                : "Nenhum perfil pendente no momento."}
          </div>
        ) : (
          <div className="grid gap-5">
            {profiles?.map((profile) => (
              <article
                key={profile.id}
                className={`grid gap-5 border bg-white p-4 shadow-[0_12px_32px_rgba(20,17,14,0.08)] lg:grid-cols-[1fr_1.2fr] ${
                  profile.profileWatchMatches.length > 0
                    ? "border-amber-500 ring-2 ring-amber-400/20"
                    : profile.isApprovalPriority
                      ? "border-gold ring-2 ring-gold/15"
                    : "border-[var(--platinum)]"
                }`}
              >
                <div className="grid grid-cols-3 gap-3">
                  {profile.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-[var(--platinum)]"
                    >
                      <PhotoZoom
                        src={`/api/admin/review-photos/${encodeURIComponent(photo.id)}`}
                        thumbnailSrc={`/api/admin/review-photos/${encodeURIComponent(photo.id)}?variant=card&v=3`}
                        alt={`Foto ${index + 1} de ${profile.username}`}
                        buttonClassName="absolute inset-0 z-0 block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--gold)]"
                      />
                      <Button
                        type="button"
                        size="icon"
                        aria-label={`Remover foto ${index + 1} de ${profile.username}`}
                        title="Remover foto"
                        disabled={
                          deletingPhotoId === photo.id ||
                          reviewingId === profile.id ||
                          prioritizingId === profile.id
                        }
                        onClick={() => void removePhoto(profile, photo)}
                        className="absolute right-2 top-2 z-10 rounded-sm bg-[var(--ruby)] text-white shadow-md hover:bg-[color-mix(in_srgb,var(--ruby)_86%,var(--black))]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-3 border-b border-[var(--platinum)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {profile.reapplicationCount > 0 ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ruby/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-ruby">
                          <RotateCcw className="h-4 w-4" />
                          Retorno {profile.reapplicationCount + 1}ª tentativa
                          {profile.reapplicationPin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 tracking-[0.16em]">
                              <KeyRound className="h-3 w-3" />
                              {profile.reapplicationPin}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                      {profile.isApprovalPriority ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-gold">
                          <Zap className="h-4 w-4" />
                          Prioridade paga
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                          Fila normal
                        </span>
                      )}
                      {profile.profileWatchMatches.length > 0 ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-amber-900">
                          <TriangleAlert className="h-4 w-4" /> Alerta Watch
                        </span>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        reviewingId === profile.id ||
                        prioritizingId === profile.id
                      }
                      onClick={() => void updatePriority(profile)}
                      className="h-10 rounded-sm border-gold/45 font-bold text-black-jewel hover:bg-gold/10"
                    >
                      <Zap className="h-4 w-4 text-gold" />
                      {profile.isApprovalPriority
                        ? "Remover prioridade"
                        : "Confirmar PIX de R$ 30"}
                    </Button>
                  </div>

                  {profile.profileWatchMatches.length > 0 ? (
                    <div className="rounded-sm border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950" role="alert">
                      <div className="flex items-center gap-2 font-extrabold">
                        <TriangleAlert className="h-4 w-4" /> Este cadastro utilizou o mesmo IP de perfil monitorado
                      </div>
                      {profile.profileWatchMatches.map((match) => (
                        <p key={match.id} className="mt-2 leading-5">
                          Relacionado a <strong>@{match.watch.watchedUser.username}</strong>. Motivo: {match.watch.reason}. IP: {match.ipAddress}.
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <ProfileField label="Usuário" value={profile.username} />
                    <ProfileField label="E-mail" value={profile.email} />
                    <ProfileField
                      label="Celular da conta (privado)"
                      value={profile.accountPhone}
                    />
                    <ProfileField label="Perfil" value={profile.gender} />
                    <ProfileField label="Busca" value={profile.lookingFor} />
                    <ProfileField
                      label="Nascimento"
                      value={formatDate(profile.birthDate)}
                    />
                    <ProfileField
                      label="Local"
                      value={[profile.city, profile.state, profile.country]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <ProfileField
                      label="WhatsApp para contato"
                      value={profile.whatsapp}
                    />
                    <ProfileField label="Telegram" value={profile.telegram} />
                    <ProfileField label="Instagram" value={profile.instagram} />
                    <ProfileField
                      label="Enviado em"
                      value={formatDate(profile.createdAt)}
                    />
                    {profile.isApprovalPriority ? (
                      <ProfileField
                        label="Prioridade confirmada em"
                        value={formatDate(profile.approvalPriorityPaidAt)}
                      />
                    ) : null}
                    <ProfileField
                      label="Status"
                      value={profile.approvalStatus}
                    />
                    {profile.reappliedAt ? (
                      <ProfileField
                        label="Reenviado em"
                        value={formatDate(profile.reappliedAt)}
                      />
                    ) : null}
                  </div>

                  {profile.reapplicationCount > 0 &&
                  profile.reapplicationModerationReason ? (
                    <section
                      aria-label="Histórico da reaplicação"
                      className="rounded-md border border-ruby/25 bg-ruby/6 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <RotateCcw
                          aria-hidden="true"
                          className="mt-0.5 h-5 w-5 shrink-0 text-ruby"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ruby">
                            Motivo do retorno para correção
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-black-jewel">
                            {profile.reapplicationModerationReason}
                          </p>
                          <p className="mt-2 text-xs font-bold text-black/55">
                            Ação anterior:{" "}
                            {formatModerationAction(
                              profile.reapplicationModerationAction,
                            )}
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <div
                    className={`grid gap-3 ${
                      isWaitingQueue ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    }`}
                  >
                    <Button
                      type="button"
                      disabled={
                        reviewingId === profile.id ||
                        prioritizingId === profile.id
                      }
                      onClick={() => void reviewProfile(profile.id, "reject")}
                      className="h-11 rounded-sm bg-[var(--ruby)] font-bold text-white hover:bg-[color-mix(in_srgb,var(--ruby)_86%,var(--black))]"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeitar
                    </Button>
                    {!isWaitingQueue ? (
                      <Button
                        type="button"
                        disabled={
                          reviewingId === profile.id ||
                          prioritizingId === profile.id
                        }
                        onClick={() => void reviewProfile(profile.id, "wait")}
                        className="h-11 rounded-sm bg-[var(--gold)] font-bold text-white hover:bg-[color-mix(in_srgb,var(--gold)_86%,var(--black))]"
                      >
                        <Hourglass className="mr-2 h-4 w-4" />
                        Aguardar
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      disabled={
                        reviewingId === profile.id ||
                        prioritizingId === profile.id
                      }
                      onClick={() => void reviewProfile(profile.id, "approve")}
                      className="h-11 rounded-sm bg-[var(--emerald)] font-bold text-white hover:bg-[color-mix(in_srgb,var(--emerald)_86%,var(--black))]"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            <nav
              aria-label={`Paginação de perfis ${
                isWaitingQueue ? "aguardando" : "pendentes"
              }`}
              className="flex items-center justify-between gap-3 border border-[var(--platinum)] bg-white p-3"
            >
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !pagination?.hasPreviousPage}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="rounded-sm"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <span className="text-center text-sm font-bold">
                Página {pagination?.page} de {pagination?.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !pagination?.hasNextPage}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="rounded-sm"
              >
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
}

export default function AdminApprovalsPage() {
  const pathname = usePathname();
  return (
    <AdminReviewQueue
      queue={pathname === "/admin/waiting" ? "waiting" : "pending"}
    />
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="border-b border-[var(--platinum)] pb-2">
      <span className="block text-xs font-bold uppercase text-[var(--gold)]">
        {label}
      </span>
      <span className="block break-words font-medium">
        {value && value.length > 0 ? value : "-"}
      </span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatModerationAction(value?: string | null) {
  const labels: Record<string, string> = {
    PROFILE_REJECTED: "Perfil rejeitado",
    PHOTO_REJECTED: "Foto rejeitada",
    CONTENT_REMOVED: "Conteúdo removido",
    BANNED: "Conta excluída ou bloqueada",
    SUSPENDED: "Conta suspensa",
  };

  return value ? (labels[value] ?? value) : "Perfil rejeitado";
}
