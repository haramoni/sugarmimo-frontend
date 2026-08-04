"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ClipboardList,
  Crown,
  LogOut,
  RefreshCw,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

type PendingPhoto = {
  id: string;
  dataUrl: string;
  fileName: string | null;
  mimeType: string | null;
  sortOrder: number;
};

type PendingProfile = {
  id: string;
  username: string;
  email: string;
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
  createdAt: string | null;
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

export default function AdminApprovalsPage() {
  const router = useRouter();
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
  const latestRequestId = useRef(0);

  const loadProfiles = useCallback(
    async (requestedPage: number) => {
      const requestId = ++latestRequestId.current;
      setError("");
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/admin/pending-babies?page=${requestedPage}&pageSize=${PAGE_SIZE}`,
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
    [router],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(page), 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles, page]);

  async function reviewProfile(id: string, action: "approve" | "reject") {
    setReviewingId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/profiles/${id}/${action}`, {
        method: "PATCH",
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
            <h1 className="text-2xl font-bold">Aprovar Babies</h1>
            <p className="text-sm text-[color:color-mix(in_srgb,var(--black)_62%,transparent)]">
              Perfis aguardando avaliação manual.
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--gold)]">
            {pagination?.totalItems} pendente(s)
          </span>
        </div>

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
            Nenhum perfil pendente no momento.
          </div>
        ) : (
          <div className="grid gap-5">
            {profiles?.map((profile) => (
              <article
                key={profile.id}
                className="grid gap-5 border border-[var(--platinum)] bg-white p-4 shadow-[0_12px_32px_rgba(20,17,14,0.08)] lg:grid-cols-[1fr_1.2fr]"
              >
                <div className="grid grid-cols-3 gap-3">
                  {profile.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="aspect-[3/4] overflow-hidden rounded-sm bg-[var(--platinum)]"
                    >
                      {/* Data URLs are uploaded user previews and cannot be optimized by next/image. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.dataUrl}
                        alt={`Foto ${index + 1} de ${profile.username}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <ProfileField label="Usuário" value={profile.username} />
                    <ProfileField label="E-mail" value={profile.email} />
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
                    <ProfileField label="WhatsApp" value={profile.whatsapp} />
                    <ProfileField label="Telegram" value={profile.telegram} />
                    <ProfileField label="Instagram" value={profile.instagram} />
                    <ProfileField
                      label="Enviado em"
                      value={formatDate(profile.createdAt)}
                    />
                    <ProfileField
                      label="Status"
                      value={profile.approvalStatus}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      disabled={reviewingId === profile.id}
                      onClick={() => void reviewProfile(profile.id, "reject")}
                      className="h-11 rounded-sm bg-[var(--ruby)] font-bold text-white hover:bg-[color-mix(in_srgb,var(--ruby)_86%,var(--black))]"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeitar
                    </Button>
                    <Button
                      type="button"
                      disabled={reviewingId === profile.id}
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
              aria-label="Paginação de perfis pendentes"
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
