"use client";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "../components/ui/Navbar";
import { useAuth } from "../components/AuthProvider";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";
import StatePanel from "./components/StatePanel";
import ProfileCard from "./components/ProfileCard";
import { getProfilePhoto } from "./profile-utils";
import type { PublicProfile, PublicProfilePage } from "./types";

const PAGE_SIZE = 6;
const SEARCH_STATE_KEY = "sugarmimo:buscar-state";

type SavedSearchState = {
  searchDraft: string;
  search: string;
  page: number;
  scrollY: number;
};

export default function BuscarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [scrollToRestore, setScrollToRestore] = useState<number | null>(null);

  const normalizedRole = user?.role?.trim().toUpperCase();
  const isDaddy = normalizedRole === "SUGAR_DADDY";
  const canSearch = ["SUGAR_BABY", "SUGAR_DADDY"].includes(
    normalizedRole ?? "",
  );
  const targetLabel = isDaddy
    ? "Sugar Babies aprovadas"
    : "Sugar Daddies ativos";
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    const savedState = readSavedSearchState();
    const frame = window.requestAnimationFrame(() => {
      if (savedState) {
        setSearchDraft(savedState.searchDraft);
        setSearch(savedState.search);
        setPage(savedState.page);
        setScrollToRestore(savedState.scrollY);
      }

      setHasRestoredState(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasRestoredState) {
      return;
    }

    function saveCurrentState() {
      saveSearchState({
        searchDraft,
        search,
        page,
        scrollY: window.scrollY,
      });
    }

    saveCurrentState();
    window.addEventListener("scroll", saveCurrentState, { passive: true });

    return () => {
      window.removeEventListener("scroll", saveCurrentState);
      saveCurrentState();
    };
  }, [hasRestoredState, page, search, searchDraft]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  useEffect(() => {
    if (!hasRestoredState || !user || isApprovalPending || !canSearch) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    if (search.trim()) {
      params.set("search", search.trim());
    }

    fetch(`/api/matches${params.size ? `?${params.toString()}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);

        if (response.status === 401) {
          router.replace("/login");
          return null;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ?? "Nao foi possivel carregar a busca.",
          );
        }

        return result as PublicProfilePage;
      })
      .then((result) => {
        if (!controller.signal.aborted && result) {
          setProfiles(Array.isArray(result.items) ? result.items : []);
          setTotal(Number(result.total) || 0);
          setTotalPages(Number(result.totalPages) || 0);
          setError("");
        }
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Nao foi possivel carregar a busca.",
        );
        setProfiles([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    canSearch,
    hasRestoredState,
    isApprovalPending,
    page,
    router,
    search,
    user,
  ]);

  useEffect(() => {
    if (isLoading || scrollToRestore === null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollToRestore, behavior: "auto" });
      setScrollToRestore(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, scrollToRestore]);

  const featuredCount = useMemo(
    () => profiles.filter((profile) => getProfilePhoto(profile)).length,
    [profiles],
  );
  const onlineCount = useMemo(
    () => profiles.filter((profile) => profile.isOnline).length,
    [profiles],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchDraft.trim();

    if (nextSearch === search) {
      return;
    }

    setIsLoading(true);
    setError("");
    setPage(1);
    setSearch(nextSearch);
  }

  function goToPage(nextPage: number) {
    if (
      isLoading ||
      nextPage === page ||
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    setIsLoading(true);
    setError("");
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      document
        .getElementById("profile-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--ruby)_10%,transparent),transparent_26%),url('/wallpaper-marble.png')] bg-cover bg-fixed bg-center text-black-jewel">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(260px,330px)_minmax(0,1fr)]">
            <aside className="h-fit rounded-lg border border-emerald/26 bg-[color-mix(in_srgb,var(--surface)_90%,white)] p-4 shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70 backdrop-blur sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald text-white shadow-[0_12px_28px_rgba(0,108,88,0.22)]">
                  <Crown className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-black-jewel">
                    Buscar
                  </h1>
                  <p className="text-sm font-semibold text-black-jewel/64">
                    {targetLabel}
                  </p>
                </div>
              </div>

              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <label className="block text-sm font-bold text-black-jewel">
                  Nome, cidade ou estado
                </label>
                <div className="flex min-w-0 gap-2">
                  <Input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Ex: Sao Paulo"
                    className="h-11 min-w-0 rounded-sm border-emerald/28 bg-white/88 focus-visible:border-emerald"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Buscar perfis"
                    className="h-11 w-11 shrink-0 rounded-sm bg-emerald text-white hover:bg-emerald/84"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </aside>

            <section id="profile-results" className="min-w-0 scroll-mt-24">
              {!canSearch ? (
                <AccessNotice />
              ) : error ? (
                <StatePanel
                  icon={ShieldCheck}
                  title="Busca indisponivel"
                  description={error}
                />
              ) : isLoading ? (
                <StatePanel
                  icon={Loader2}
                  title="Carregando perfis"
                  description={`Estamos buscando ${targetLabel.toLocaleLowerCase("pt-BR")} para você.`}
                  spin
                />
              ) : profiles.length === 0 ? (
                <StatePanel
                  icon={Search}
                  title="Nenhum perfil encontrado"
                  description="Tente buscar por outro nome, cidade ou estado."
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {profiles.map((profile) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onNavigate={() =>
                          saveSearchState({
                            searchDraft,
                            search,
                            page,
                            scrollY: window.scrollY,
                          })
                        }
                      />
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    total={total}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function readSavedSearchState(): SavedSearchState | null {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(SEARCH_STATE_KEY) ?? "null",
    ) as Partial<SavedSearchState> | null;

    if (!parsed || !Number.isInteger(parsed.page) || Number(parsed.page) < 1) {
      return null;
    }

    return {
      searchDraft: typeof parsed.searchDraft === "string" ? parsed.searchDraft : "",
      search: typeof parsed.search === "string" ? parsed.search : "",
      page: Number(parsed.page),
      scrollY:
        typeof parsed.scrollY === "number" && parsed.scrollY >= 0
          ? parsed.scrollY
          : 0,
    };
  } catch {
    return null;
  }
}

function saveSearchState(state: SavedSearchState) {
  try {
    window.sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
  } catch {
    // The search still works if session storage is unavailable.
  }
}

function Pagination({
  page,
  total,
  totalPages,
  onPageChange,
}: {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const firstProfile = (page - 1) * PAGE_SIZE + 1;
  const lastProfile = Math.min(page * PAGE_SIZE, total);
  const pageItems = getPaginationItems(page, totalPages);
  const navigationButton =
    "inline-flex h-10 items-center justify-center gap-1 rounded-full border border-emerald/22 bg-white/82 px-3 text-sm font-extrabold text-black-jewel shadow-[0_6px_16px_rgba(0,55,44,0.06)] transition hover:border-emerald/45 hover:bg-emerald hover:text-white disabled:pointer-events-none disabled:opacity-35 sm:px-4";

  return (
    <nav
      aria-label="Paginação de perfis"
      className="overflow-hidden rounded-lg border border-emerald/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_94%,white),color-mix(in_srgb,var(--emerald)_7%,white))] px-3 py-4 shadow-[0_16px_38px_rgba(20,17,14,0.09)] ring-1 ring-white/70 sm:px-5"
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className={navigationButton}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Ir para a página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1" aria-label="Páginas">
          {pageItems.map((item, index) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Ir para a página ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={[
                  "grid h-10 min-w-10 place-items-center rounded-full border px-2 text-sm font-extrabold transition",
                  item === page
                    ? "border-emerald bg-emerald text-white shadow-[0_9px_22px_rgba(0,108,88,0.24)]"
                    : "border-transparent bg-transparent text-black-jewel/70 hover:border-emerald/28 hover:bg-white/85 hover:text-emerald",
                ].join(" ")}
              >
                {item}
              </button>
            ) : (
              <span
                key={`${item}-${index}`}
                className="grid h-10 w-7 place-items-center text-black-jewel/45"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          className={navigationButton}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Ir para a próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis" as const, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis" as const, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis" as const, currentPage, "ellipsis" as const, totalPages];
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-sm border border-emerald/20 bg-white/74 px-3 py-2 shadow-[0_8px_18px_rgba(0,55,44,0.06)]">
      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-black-jewel/68">
        <Icon className="h-4 w-4 shrink-0 text-emerald" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-lg font-extrabold text-black-jewel">
        {value}
      </span>
    </div>
  );
}

function AccessNotice() {
  return (
    <StatePanel
      icon={ShieldCheck}
      title="Busca indisponível"
      description="Esta área está disponível para perfis Sugar Baby e Sugar Daddy."
    />
  );
}
