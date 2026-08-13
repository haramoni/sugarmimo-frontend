"use client";

import { Crown, Loader2, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
import type { PublicProfile, PublicProfilePage } from "./types";

const PAGE_SIZE = 6;
const SEARCH_STATE_KEY = "sugarmimo:buscar-state";

type SavedSearchState = {
  searchDraft: string;
  search: string;
  page: number;
  scrollY: number;
  anchorProfileId: string | null;
  anchorOffset: number | null;
};

export default function BuscarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [scrollToRestore, setScrollToRestore] = useState<number | null>(null);
  const [anchorToRestore, setAnchorToRestore] = useState<{
    profileId: string;
    offset: number;
  } | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const restoredPageRef = useRef(1);
  const navigationAnchorRef = useRef<{
    profileId: string;
    offset: number;
  } | null>(null);

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
        restoredPageRef.current = savedState.page;
        setScrollToRestore(savedState.scrollY);
        if (savedState.anchorProfileId && savedState.anchorOffset !== null) {
          setAnchorToRestore({
            profileId: savedState.anchorProfileId,
            offset: savedState.anchorOffset,
          });
        }
      } else {
        setIsScrollRestored(true);
      }

      setHasRestoredState(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasRestoredState || !isScrollRestored) {
      return;
    }

    function saveCurrentState() {
      saveSearchState({
        searchDraft,
        search,
        page,
        scrollY: window.scrollY,
        anchorProfileId: navigationAnchorRef.current?.profileId ?? null,
        anchorOffset: navigationAnchorRef.current?.offset ?? null,
      });
    }

    saveCurrentState();
    window.addEventListener("scroll", saveCurrentState, { passive: true });

    return () => {
      window.removeEventListener("scroll", saveCurrentState);
      saveCurrentState();
    };
  }, [hasRestoredState, isScrollRestored, page, search, searchDraft]);

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
    const pagesToLoad = Array.from(
      { length: Math.max(1, restoredPageRef.current) },
      (_, index) => index + 1,
    );
    restoredPageRef.current = 1;

    Promise.all(
      pagesToLoad.map((pageNumber) =>
        fetchMatchPage(pageNumber, search, controller.signal),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) {
          return;
        }

        const validResults = results.filter(
          (result): result is PublicProfilePage => result !== null,
        );
        const lastResult = validResults.at(-1);

        if (!lastResult) {
          router.replace("/login");
          return;
        }

        setProfiles(
          deduplicateProfiles(validResults.flatMap((result) => result.items)),
        );
        setPage(Number(lastResult.page) || 1);
        setHasMore(Boolean(lastResult.hasMore));
        setError("");
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Não foi possível carregar a busca.",
        );
        setProfiles([]);
        setHasMore(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canSearch, hasRestoredState, isApprovalPending, router, search, user]);

  useEffect(() => {
    if (isLoading || isScrollRestored || scrollToRestore === null) {
      return;
    }

    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        restoreListPosition(scrollToRestore, anchorToRestore);
        setScrollToRestore(null);
        setAnchorToRestore(null);
        setIsScrollRestored(true);
      });

      navigationAnchorRef.current = null;
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [anchorToRestore, isLoading, isScrollRestored, scrollToRestore]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchDraft.trim();

    if (nextSearch === search) {
      return;
    }

    setIsLoading(true);
    setError("");
    setPage(1);
    setProfiles([]);
    restoredPageRef.current = 1;
    setSearch(nextSearch);
  }

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const result = await fetchMatchPage(nextPage, search);

      if (!result) {
        router.replace("/login");
        return;
      }

      setProfiles((current) =>
        deduplicateProfiles([...current, ...result.items]),
      );
      setPage(Number(result.page) || nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar mais perfis.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, router, search]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;

    if (
      !sentinel ||
      !isScrollRestored ||
      isLoading ||
      isLoadingMore ||
      error ||
      !hasMore
    ) {
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
  }, [error, hasMore, isLoading, isLoadingMore, isScrollRestored, loadMore]);

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--ruby)_10%,transparent),transparent_26%),url('/wallpaper-marble.webp')] bg-cover bg-center text-black-jewel md:bg-fixed">
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
              ) : error && profiles?.length === 0 ? (
                <StatePanel
                  icon={ShieldCheck}
                  title="Busca indisponível"
                  description={error}
                />
              ) : isLoading ? (
                <StatePanel
                  icon={Loader2}
                  title="Carregando perfis"
                  description={`Estamos buscando ${targetLabel.toLocaleLowerCase("pt-BR")} para você.`}
                  spin
                />
              ) : profiles?.length === 0 ? (
                <StatePanel
                  icon={Search}
                  title="Nenhum perfil encontrado"
                  description="Tente buscar por outro nome, cidade ou estado."
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {profiles.map((profile, index) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        eager={index < 3}
                        onNavigate={() => {
                          navigationAnchorRef.current = getProfileAnchor(
                            profile.id,
                          );
                          saveSearchState({
                            searchDraft,
                            search,
                            page,
                            scrollY: window.scrollY,
                            anchorProfileId:
                              navigationAnchorRef.current?.profileId ?? null,
                            anchorOffset:
                              navigationAnchorRef.current?.offset ?? null,
                          });
                        }}
                      />
                    ))}
                  </div>

                  {error ? (
                    <p className="text-center text-sm font-bold text-ruby">
                      {error}
                    </p>
                  ) : null}

                  <div
                    ref={loadMoreSentinelRef}
                    className="flex min-h-16 items-center justify-center"
                    aria-live="polite"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-black-jewel/62">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald" />
                        Carregando mais perfis
                      </div>
                    ) : error && hasMore ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadMore()}
                        className="rounded-full border-emerald/30 bg-white/82 font-extrabold text-emerald hover:bg-emerald hover:text-white"
                      >
                        Tentar carregar novamente
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

async function fetchMatchPage(
  page: number,
  search: string,
  signal?: AbortSignal,
): Promise<PublicProfilePage | null> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`/api/matches?${params.toString()}`, { signal });
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(result?.message ?? "Não foi possível carregar a busca.");
  }

  return result as PublicProfilePage;
}

function deduplicateProfiles(profiles: PublicProfile[]) {
  return Array.from(
    new Map(profiles.map((profile) => [profile.id, profile])).values(),
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
      searchDraft:
        typeof parsed.searchDraft === "string" ? parsed.searchDraft : "",
      search: typeof parsed.search === "string" ? parsed.search : "",
      page: Number(parsed.page),
      scrollY:
        typeof parsed.scrollY === "number" && parsed.scrollY >= 0
          ? parsed.scrollY
          : 0,
      anchorProfileId:
        typeof parsed.anchorProfileId === "string"
          ? parsed.anchorProfileId
          : null,
      anchorOffset:
        typeof parsed.anchorOffset === "number" ? parsed.anchorOffset : null,
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

function getProfileAnchor(profileId: string) {
  const card = document.getElementById(`profile-card-${profileId}`);

  return card ? { profileId, offset: card.getBoundingClientRect().top } : null;
}

function restoreListPosition(
  scrollY: number,
  anchor: { profileId: string; offset: number } | null,
) {
  const card = anchor
    ? document.getElementById(`profile-card-${anchor.profileId}`)
    : null;

  if (card && anchor) {
    window.scrollTo({
      top: Math.max(
        0,
        window.scrollY + card.getBoundingClientRect().top - anchor.offset,
      ),
      behavior: "auto",
    });
    return;
  }

  window.scrollTo({ top: scrollY, behavior: "auto" });
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
