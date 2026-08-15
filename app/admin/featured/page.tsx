"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Images,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Star,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPhotoGallery, type AdminGalleryPhoto } from "./AdminPhotoGallery";

const PAGE_SIZE = 12;

type FeaturedBaby = {
  id: string;
  username: string;
  city: string | null;
  state: string | null;
  isAdminFeatured: boolean;
  createdAt: string | null;
  photos: Array<{
    id: string;
    dataUrl: string;
    sortOrder: number;
  }>;
};

type FeaturedPage = {
  items: FeaturedBaby[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
  };
};

export default function AdminFeaturedPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<FeaturedBaby[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [loadingGalleryId, setLoadingGalleryId] = useState("");
  const [gallery, setGallery] = useState<{
    username: string;
    photos: AdminGalleryPhoto[];
  } | null>(null);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadFirstPage = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await fetchPage(1, search);
      if (!result) {
        router.push("/admin/login");
        return;
      }

      setProfiles(result.items);
      setPage(result.pagination.page);
      setTotalItems(result.pagination.totalItems);
      setHasMore(result.pagination.hasNextPage);
    } catch (loadError) {
      setError(toMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [router, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadFirstPage(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      const result = await fetchPage(page + 1, search);
      if (!result) {
        router.push("/admin/login");
        return;
      }

      setProfiles((current) =>
        Array.from(
          new Map(
            [...current, ...result.items].map((profile) => [
              profile.id,
              profile,
            ]),
          ).values(),
        ),
      );
      setPage(result.pagination.page);
      setTotalItems(result.pagination.totalItems);
      setHasMore(result.pagination.hasNextPage);
    } catch (loadError) {
      setError(toMessage(loadError));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, router, search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isLoading || isLoadingMore || !hasMore || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, isLoading, isLoadingMore, loadMore]);

  async function toggleStar(profile: FeaturedBaby) {
    setUpdatingId(profile.id);
    setError("");
    const status = profile.isAdminFeatured ? "unfeature" : "feature";

    try {
      const response = await fetch(
        `/api/admin/featured-babies/${encodeURIComponent(profile.id)}/${status}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível alterar a estrela.",
        );
      }

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? { ...item, isAdminFeatured: Boolean(result.isAdminFeatured) }
            : item,
        ),
      );
    } catch (updateError) {
      setError(toMessage(updateError));
    } finally {
      setUpdatingId("");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchDraft.trim();

    if (nextSearch === search) {
      void loadFirstPage();
      return;
    }

    setSearch(nextSearch);
  }

  function clearSearch() {
    setSearchDraft("");
    if (search) {
      setSearch("");
    }
  }

  async function openGallery(profile: FeaturedBaby) {
    setLoadingGalleryId(profile.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/featured-babies/${encodeURIComponent(profile.id)}/photos`,
        { cache: "no-store" },
      );
      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível carregar as fotos.",
        );
      }
      if (!Array.isArray(result?.photos) || result.photos.length === 0) {
        throw new Error("Este perfil não possui fotos para visualizar.");
      }

      setGallery({
        username: result.username ?? profile.username,
        photos: result.photos as AdminGalleryPhoto[],
      });
    } catch (galleryError) {
      setError(toMessage(galleryError));
    } finally {
      setLoadingGalleryId("");
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
              aria-label="Voltar para aprovações"
              title="Voltar para aprovações"
              onClick={() => router.push("/admin/approvals")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atualizar lista"
              title="Atualizar lista"
              disabled={isLoading}
              onClick={() => void loadFirstPage()}
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

      <section className="mx-auto max-w-6xl space-y-5 px-5 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Star className="h-6 w-6 fill-[var(--gold)] text-[var(--gold)]" />
              Impulsionar Sugar Babies
            </h1>
            <p className="max-w-2xl text-sm text-black/60">
              A ESTRELA é apenas visível para o Admnistrador, ela impulsiona o
              perfil da Sugar Baby na página de destaque, aumentando a
              visibilidade e as chances de receber mais mensagens.
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--gold)]">
            {totalItems} perfil(is)
          </span>
        </div>

        <form
          onSubmit={submitSearch}
          className="flex max-w-xl items-center gap-2 border border-[var(--platinum)] bg-white p-3 shadow-[0_8px_24px_rgba(20,17,14,0.05)]"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Pesquisar username da Baby"
              aria-label="Username da Sugar Baby"
              className="h-11 rounded-sm border-[var(--platinum)] pl-9 pr-9"
            />
            {searchDraft ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-black/45 hover:bg-black/5 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 shrink-0 rounded-sm bg-[var(--gold)] font-bold text-white hover:bg-[color:color-mix(in_srgb,var(--gold)_86%,black)]"
          >
            <Search className="h-4 w-4" />
            Pesquisar
          </Button>
        </form>

        {search ? (
          <p className="text-sm font-medium text-black/60">
            Resultado para <strong className="text-black">{search}</strong>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 border border-[var(--platinum)] bg-white font-bold">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--gold)]" />
            Carregando perfis...
          </div>
        ) : profiles.length === 0 ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Nenhuma Sugar Baby aprovada e ativa no momento.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => {
              const photo = profile.photos[0];
              const location = [profile.city, profile.state]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={profile.id}
                  className={[
                    "overflow-hidden border bg-white shadow-[0_10px_28px_rgba(20,17,14,0.07)] transition",
                    profile.isAdminFeatured
                      ? "border-[var(--gold)] ring-2 ring-[color:color-mix(in_srgb,var(--gold)_20%,transparent)]"
                      : "border-[var(--platinum)]",
                  ].join(" ")}
                >
                  <div className="relative aspect-[4/3] bg-[var(--platinum)]">
                    {photo?.dataUrl ? (
                      <button
                        type="button"
                        onClick={() => void openGallery(profile)}
                        disabled={loadingGalleryId === profile.id}
                        aria-label={`Ampliar e ver fotos de ${profile.username}`}
                        className="group block h-full w-full cursor-zoom-in"
                      >
                        {/* Uploaded data URLs cannot use Next image optimization. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.dataUrl}
                          alt={`Foto de ${profile.username}`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/72 px-3 py-1.5 text-xs font-bold text-white">
                          {loadingGalleryId === profile.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Images className="h-3.5 w-3.5" />
                          )}
                          Ver fotos
                        </span>
                      </button>
                    ) : (
                      <div className="grid h-full place-items-center text-black/30">
                        <UserRound className="h-12 w-12" />
                      </div>
                    )}
                    {profile.isAdminFeatured ? (
                      <span
                        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg"
                        title="Estrela ativa"
                      >
                        <Star className="h-5 w-5 fill-[var(--gold)] text-[var(--gold)]" />
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold">
                        {profile.username}
                      </h2>
                      <p className="flex items-center gap-1 text-xs text-black/55">
                        <MapPin className="h-3.5 w-3.5" />
                        {location || "Local não informado"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={updatingId === profile.id}
                      onClick={() => void toggleStar(profile)}
                      className={[
                        "min-h-11 w-full rounded-sm font-bold",
                        profile.isAdminFeatured
                          ? "bg-black/70 text-white hover:bg-black/80"
                          : "bg-[var(--gold)] text-white hover:bg-[color:color-mix(in_srgb,var(--gold)_86%,black)]",
                      ].join(" ")}
                    >
                      {updatingId === profile.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star
                          className={
                            profile.isAdminFeatured
                              ? "h-4 w-4 fill-white"
                              : "h-4 w-4"
                          }
                        />
                      )}
                      {profile.isAdminFeatured
                        ? "Remover estrela"
                        : "Dar estrela"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div
          ref={sentinelRef}
          className="flex min-h-20 items-center justify-center"
          aria-live="polite"
        >
          {isLoadingMore ? (
            <span className="flex items-center gap-2 text-sm font-bold text-black/55">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--gold)]" />
              Carregando mais perfis...
            </span>
          ) : error && hasMore ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadMore()}
            >
              Tentar carregar novamente
            </Button>
          ) : null}
        </div>
      </section>

      {gallery ? (
        <AdminPhotoGallery
          username={gallery.username}
          photos={gallery.photos}
          onClose={() => setGallery(null)}
        />
      ) : null}
    </main>
  );
}

async function fetchPage(
  page: number,
  search: string,
): Promise<FeaturedPage | null> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });

  if (search) {
    params.set("search", search);
  }

  const response = await fetch(`/api/admin/featured-babies?${params}`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    return null;
  }
  if (!response.ok) {
    throw new Error(result?.message ?? "Não foi possível carregar os perfis.");
  }

  return result as FeaturedPage;
}

function toMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}
