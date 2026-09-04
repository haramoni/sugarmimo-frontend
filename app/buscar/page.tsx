"use client";

import { Crown, Loader2, MapPin, Search, ShieldCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "../components/ui/Navbar";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";
import { useAuth } from "../components/AuthProvider";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";
import StatePanel from "./components/StatePanel";
import ProfileCard from "./components/ProfileCard";
import AgeRangeFilter from "./components/AgeRangeFilter";
import type { PublicProfile, PublicProfilePage } from "./types";
import {
  getRelationshipIntentLabel,
  normalizeRelationshipIntent,
  type RelationshipMode,
} from "../lib/relationship-intent";

const PAGE_SIZE = 6;
const SEARCH_STATE_KEY = "sugarmimo:buscar-state";

const BABY_GENDER_FILTER_OPTIONS = [
  { value: "sugar-baby-woman", label: "Mulheres", group: "women" },
  {
    value: "sugar-baby-trans-woman",
    label: "Mulheres trans",
    group: "women",
  },
  { value: "sugar-baby-man", label: "Homens", group: "men" },
  {
    value: "sugar-baby-trans-man",
    label: "Homens trans",
    group: "men",
  },
  { value: "sugar-baby-lgbtqia", label: "LGBTQIA+", group: "both" },
] as const;

function genderFilterOptionsFor(lookingFor?: string | null) {
  const preference = lookingFor?.trim().toLowerCase();

  if (preference === "women" || preference === "men") {
    return BABY_GENDER_FILTER_OPTIONS.filter(
      (option) => option.group === preference,
    );
  }

  return [...BABY_GENDER_FILTER_OPTIONS];
}

type SavedSearchState = {
  searchDraft: string;
  search: string;
  minAgeDraft: string;
  maxAgeDraft: string;
  genderDraft: string;
  minAge: string;
  maxAge: string;
  gender: string;
  relationshipMode: RelationshipMode;
  page: number;
  scrollY: number;
  anchorProfileId: string | null;
  anchorOffset: number | null;
};

type SearchCoordinates = {
  latitude: number;
  longitude: number;
};

type LocationStatus = "checking" | "enabled" | "denied" | "unsupported";

export default function BuscarPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [minAgeDraft, setMinAgeDraft] = useState("18");
  const [maxAgeDraft, setMaxAgeDraft] = useState("80");
  const [genderDraft, setGenderDraft] = useState("");
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("80");
  const [gender, setGender] = useState("");
  const [relationshipMode, setRelationshipMode] =
    useState<RelationshipMode>("COMPATIBLE");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState<SearchCoordinates | null>(
    null,
  );
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("checking");
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [scrollToRestore, setScrollToRestore] = useState<number | null>(null);
  const [anchorToRestore, setAnchorToRestore] = useState<{
    profileId: string;
    offset: number;
  } | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const hasRequestedLocationRef = useRef(false);
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
  const genderFilterOptions = genderFilterOptionsFor(user?.lookingFor);
  const validGenderFilters = new Set(
    genderFilterOptions.map((option) => option.value),
  );
  const compatibleGenderDraft = validGenderFilters.has(
    genderDraft as (typeof BABY_GENDER_FILTER_OPTIONS)[number]["value"],
  )
    ? genderDraft
    : "";
  const compatibleGender = validGenderFilters.has(
    gender as (typeof BABY_GENDER_FILTER_OPTIONS)[number]["value"],
  )
    ? gender
    : "";
  const providerTargetLabel =
    user?.lookingFor?.trim().toLowerCase() === "women"
      ? "Sugar Mommies ativas"
      : user?.lookingFor?.trim().toLowerCase() === "men"
        ? "Sugar Daddies ativos"
        : "Sugar Daddies e Mommies ativos";
  const targetLabel =
    relationshipMode === "TRADITIONAL"
      ? "Conexões tradicionais"
      : relationshipMode === "SUGAR"
        ? isDaddy
          ? "Sugar Babies aprovadas"
          : providerTargetLabel
        : "Conexões compatíveis";
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    const savedState = readSavedSearchState();
    const frame = window.requestAnimationFrame(() => {
      if (savedState) {
        setSearchDraft(savedState.searchDraft);
        setSearch(savedState.search);
        setMinAgeDraft(savedState.minAgeDraft);
        setMaxAgeDraft(savedState.maxAgeDraft);
        setGenderDraft(savedState.genderDraft);
        setMinAge(savedState.minAge);
        setMaxAge(savedState.maxAge);
        setGender(savedState.gender);
        setRelationshipMode(savedState.relationshipMode);
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
        minAgeDraft,
        maxAgeDraft,
        genderDraft: compatibleGenderDraft,
        minAge,
        maxAge,
        gender: compatibleGender,
        relationshipMode,
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
  }, [
    gender,
    genderDraft,
    compatibleGender,
    compatibleGenderDraft,
    relationshipMode,
    hasRestoredState,
    isScrollRestored,
    maxAge,
    maxAgeDraft,
    minAge,
    minAgeDraft,
    page,
    search,
    searchDraft,
  ]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("checking");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCoordinates = {
          // Aproximadamente 100 m: suficiente para ordenar, sem guardar o ponto exato.
          latitude: Math.round(coords.latitude * 1000) / 1000,
          longitude: Math.round(coords.longitude * 1000) / 1000,
        };
        setCoordinates(nextCoordinates);
        setLocationStatus("enabled");

        void fetch("/api/auth/search-location", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextCoordinates),
        });
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 15 * 60 * 1000,
        timeout: 10_000,
      },
    );
  }, []);

  useEffect(() => {
    if (
      user &&
      canSearch &&
      !isApprovalPending &&
      !hasRequestedLocationRef.current
    ) {
      hasRequestedLocationRef.current = true;
      requestLocation();
    }
  }, [canSearch, isApprovalPending, requestLocation, user]);

  useEffect(() => {
    if (!hasRestoredState || !canSearch || isApprovalPending) {
      return;
    }

    if (
      minAgeDraft === minAge &&
      maxAgeDraft === maxAge &&
      compatibleGenderDraft === compatibleGender
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setError("");
      setPage(1);
      setProfiles([]);
      restoredPageRef.current = 1;
      setMinAge(minAgeDraft);
      setMaxAge(maxAgeDraft);
      setGender(compatibleGenderDraft);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    canSearch,
    compatibleGender,
    compatibleGenderDraft,
    gender,
    genderDraft,
    hasRestoredState,
    isApprovalPending,
    maxAge,
    maxAgeDraft,
    minAge,
    minAgeDraft,
  ]);

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
        fetchMatchPage(
          pageNumber,
          {
            search,
            minAge,
            maxAge,
            gender: isDaddy ? compatibleGender : "",
            relationshipMode,
            coordinates,
          },
          controller.signal,
        ),
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
  }, [
    canSearch,
    compatibleGender,
    coordinates,
    gender,
    hasRestoredState,
    isDaddy,
    isApprovalPending,
    maxAge,
    minAge,
    router,
    search,
    relationshipMode,
    user,
  ]);

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
    const nextMinAge = minAgeDraft.trim();
    const nextMaxAge = maxAgeDraft.trim();

    if (nextMinAge && nextMaxAge && Number(nextMinAge) > Number(nextMaxAge)) {
      setError("A idade mínima não pode ser maior que a idade máxima.");
      return;
    }

    if (
      nextSearch === search &&
      nextMinAge === minAge &&
      nextMaxAge === maxAge &&
      compatibleGenderDraft === compatibleGender
    ) {
      return;
    }

    setIsLoading(true);
    setError("");
    setPage(1);
    setProfiles([]);
    restoredPageRef.current = 1;
    setSearch(nextSearch);
    setMinAge(nextMinAge);
    setMaxAge(nextMaxAge);
    setGender(compatibleGenderDraft);
  }

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const result = await fetchMatchPage(nextPage, {
        search,
        minAge,
        maxAge,
        gender: isDaddy ? compatibleGender : "",
        relationshipMode,
        coordinates,
      });

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
  }, [
    compatibleGender,
    coordinates,
    hasMore,
    isLoading,
    isLoadingMore,
    isDaddy,
    maxAge,
    minAge,
    page,
    router,
    search,
    relationshipMode,
  ]);

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

  if (isAuthLoading) {
    return <PremiumLoadingScreen label="Carregando a busca..." />;
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="relative min-h-screen overflow-hidden bg-luxury-black text-luxury-ivory">
        <Navbar />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_10%,color-mix(in_srgb,var(--luxury-gold)_11%,transparent),transparent_25%),radial-gradient(circle_at_92%_46%,color-mix(in_srgb,var(--luxury-gold-deep)_10%,transparent),transparent_24%),radial-gradient(circle_at_4%_82%,color-mix(in_srgb,var(--luxury-gold)_7%,transparent),transparent_22%)]"
        />

        <section className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid items-start gap-5 min-[900px]:grid-cols-[15.25rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="h-fit rounded-xl border border-luxury-gold/55 bg-[linear-gradient(145deg,var(--luxury-surface-raised),var(--luxury-night))] p-4 text-luxury-ivory shadow-[0_0_22px_rgba(213,166,78,0.11),0_22px_58px_rgba(0,0,0,0.3)] backdrop-blur sm:p-5 min-[900px]:sticky min-[900px]:top-40 xl:top-24">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-luxury-champagne/75 bg-luxury-black text-luxury-champagne shadow-[0_0_18px_rgba(213,166,78,0.28)]">
                  <Crown className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-luxury-ivory">
                    Buscar
                  </h1>
                  <p className="text-xs font-semibold text-luxury-muted">
                    {targetLabel}
                  </p>
                </div>
              </div>

              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="relationship-mode"
                    className="block text-sm font-bold text-luxury-ivory"
                  >
                    Tipo de conexão
                  </label>
                  {normalizeRelationshipIntent(user?.relationshipIntent) ===
                  "BOTH" ? (
                    <Select
                      value={relationshipMode}
                      onValueChange={(value) => {
                        setRelationshipMode(value as RelationshipMode);
                        setIsLoading(true);
                        setProfiles([]);
                        setPage(1);
                        restoredPageRef.current = 1;
                      }}
                    >
                      <SelectTrigger
                        id="relationship-mode"
                        className="h-11 w-full rounded-md border-luxury-gold/40 bg-luxury-black/72 px-3 text-sm font-semibold text-luxury-ivory focus-visible:border-luxury-champagne focus-visible:ring-luxury-gold/20 [&_svg]:text-luxury-champagne"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        align="start"
                        className="premium-select-content rounded-lg border border-luxury-gold/45 bg-luxury-surface-raised p-1 text-luxury-ivory shadow-[0_22px_48px_rgba(0,0,0,0.48)]"
                      >
                        <SelectItem
                          value="COMPATIBLE"
                          className="rounded-md text-luxury-ivory focus:bg-luxury-gold/18 focus:text-luxury-champagne data-[state=checked]:text-luxury-champagne"
                        >
                          Sugar e tradicional
                        </SelectItem>
                        <SelectItem
                          value="SUGAR"
                          className="rounded-md text-luxury-ivory focus:bg-luxury-gold/18 focus:text-luxury-champagne data-[state=checked]:text-luxury-champagne"
                        >
                          Somente Sugar
                        </SelectItem>
                        <SelectItem
                          value="TRADITIONAL"
                          className="rounded-md text-luxury-ivory focus:bg-luxury-gold/18 focus:text-luxury-champagne data-[state=checked]:text-luxury-champagne"
                        >
                          Somente tradicional
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="rounded-md border border-luxury-gold/40 bg-luxury-black/72 px-3 py-2.5 text-sm font-extrabold text-luxury-champagne">
                      {getRelationshipIntentLabel(user?.relationshipIntent)}
                    </div>
                  )}
                </div>

                <label className="block text-sm font-bold text-luxury-ivory">
                  Nome, cidade ou estado
                </label>
                <div className="flex min-w-0 gap-2">
                  <Input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Ex: Sao Paulo"
                    className="h-11 min-w-0 rounded-md border-luxury-gold/40 bg-luxury-black/72 text-luxury-ivory placeholder:text-luxury-muted/65 focus-visible:border-luxury-champagne focus-visible:ring-luxury-gold/20"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Buscar perfis"
                    className="h-11 w-11 shrink-0 rounded-md border border-luxury-gold/60 bg-luxury-black text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-luxury-ivory">
                    Faixa etária
                  </label>
                  <AgeRangeFilter
                    minAge={minAgeDraft}
                    maxAge={maxAgeDraft}
                    onMinAgeChange={setMinAgeDraft}
                    onMaxAgeChange={setMaxAgeDraft}
                  />
                </div>

                {isDaddy ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="gender-filter"
                      className="block text-sm font-bold text-luxury-ivory"
                    >
                      Estou procurando
                    </label>
                    <Select
                      value={compatibleGenderDraft || "ALL"}
                      onValueChange={(value) =>
                        setGenderDraft(value === "ALL" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        id="gender-filter"
                        className="h-11 w-full rounded-md border-luxury-gold/40 bg-luxury-black/72 px-3 text-sm font-semibold text-luxury-ivory focus-visible:border-luxury-champagne focus-visible:ring-luxury-gold/20 [&_svg]:text-luxury-champagne"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        align="start"
                        className="premium-select-content rounded-lg border border-luxury-gold/45 bg-luxury-surface-raised p-1 text-luxury-ivory shadow-[0_22px_48px_rgba(0,0,0,0.48)]"
                      >
                        <SelectItem value="ALL">
                          {user?.lookingFor?.trim().toLowerCase() === "men"
                            ? "Todos"
                            : "Todas"}
                        </SelectItem>
                        {genderFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </form>

              <div className="mt-4 flex items-start gap-2 rounded-md border border-luxury-gold/35 bg-luxury-black/55 p-3 text-xs font-semibold leading-5 text-luxury-muted">
                {locationStatus === "checking" ? (
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-luxury-gold" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-luxury-gold" />
                )}
                <div>
                  <p>
                    {locationStatus === "enabled"
                      ? "Localização ativada: perfis mais próximos aparecem primeiro."
                      : locationStatus === "checking"
                        ? "Verificando sua localização para ordenar os perfis."
                        : locationStatus === "denied"
                          ? "Localização não autorizada. Usaremos a cidade e o estado do seu perfil."
                          : "Este navegador não oferece localização. Usaremos os dados do seu perfil."}
                  </p>
                  {locationStatus === "denied" ? (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="mt-1 font-extrabold text-luxury-champagne underline underline-offset-2"
                    >
                      Tentar novamente
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>

            <section id="profile-results" className="min-w-0 scroll-mt-24">
              {!canSearch ? (
                <AccessNotice />
              ) : error && profiles?.length === 0 ? (
                <StatePanel
                  icon={ShieldCheck}
                  title="Busca indisponível"
                  description={error}
                  variant="luxuryDark"
                />
              ) : isLoading ? (
                <StatePanel
                  icon={Loader2}
                  title="Carregando perfis"
                  description={`Estamos buscando ${targetLabel.toLocaleLowerCase("pt-BR")} para você.`}
                  spin
                  variant="luxuryDark"
                />
              ) : profiles?.length === 0 ? (
                <StatePanel
                  icon={Search}
                  title="Nenhum perfil encontrado"
                  description="Tente buscar por outro nome, cidade ou estado."
                  variant="luxuryDark"
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profiles.map((profile, index) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        eager={index < 3}
                        viewerRole={user.role}
                        viewerIsPremium={Boolean(user.isPremium)}
                        variant="searchDark"
                        onNavigate={() => {
                          navigationAnchorRef.current = getProfileAnchor(
                            profile.id,
                          );
                          saveSearchState({
                            searchDraft,
                            search,
                            minAgeDraft,
                            maxAgeDraft,
                            genderDraft: compatibleGenderDraft,
                            minAge,
                            maxAge,
                            gender: compatibleGender,
                            relationshipMode,
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
                    <p className="text-center text-sm font-bold text-[#ff9eae]">
                      {error}
                    </p>
                  ) : null}

                  <div
                    ref={loadMoreSentinelRef}
                    className="flex min-h-16 items-center justify-center"
                    aria-live="polite"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-luxury-muted">
                        <Loader2 className="h-4 w-4 animate-spin text-luxury-gold" />
                        Carregando mais perfis
                      </div>
                    ) : error && hasMore ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadMore()}
                        className="rounded-full border-luxury-gold/60 bg-luxury-surface font-extrabold text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
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
  filters: {
    search: string;
    minAge: string;
    maxAge: string;
    gender: string;
    relationshipMode: RelationshipMode;
    coordinates: SearchCoordinates | null;
  },
  signal?: AbortSignal,
): Promise<PublicProfilePage | null> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.minAge) {
    params.set("minAge", filters.minAge);
  }

  if (filters.maxAge && Number(filters.maxAge) < 80) {
    params.set("maxAge", filters.maxAge);
  }

  if (filters.gender) {
    params.set("gender", filters.gender);
  }

  params.set("relationshipMode", filters.relationshipMode);

  if (filters.coordinates) {
    params.set("latitude", String(filters.coordinates.latitude));
    params.set("longitude", String(filters.coordinates.longitude));
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
      minAgeDraft: normalizeSavedAge(parsed.minAgeDraft, 18),
      maxAgeDraft: normalizeSavedAge(parsed.maxAgeDraft, 80),
      genderDraft:
        typeof parsed.genderDraft === "string" ? parsed.genderDraft : "",
      minAge: normalizeSavedAge(parsed.minAge, 18),
      maxAge: normalizeSavedAge(parsed.maxAge, 80),
      gender: typeof parsed.gender === "string" ? parsed.gender : "",
      relationshipMode:
        parsed.relationshipMode === "SUGAR" ||
        parsed.relationshipMode === "TRADITIONAL"
          ? parsed.relationshipMode
          : "COMPATIBLE",
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

function normalizeSavedAge(value: unknown, fallback: number) {
  const age = Number(value);

  if (!value || !Number.isFinite(age)) {
    return String(fallback);
  }

  return String(Math.min(80, Math.max(18, Math.round(age))));
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
      variant="luxuryDark"
    />
  );
}
