"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Crown,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileIdentityLabel } from "@/app/lib/profileIdentity";
import {
  formatMembershipExpiry,
  membershipDaysRemaining,
  membershipRemainingLabel,
} from "@/app/lib/membership";

type DaddyProfile = {
  id: string;
  username: string;
  email: string;
  gender: string | null;
  city: string | null;
  state: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  isPremiere: boolean;
  membershipTier: string | null;
  membershipUntil: string | null;
  membershipActive: boolean;
  membershipDaysRemaining: number | null;
  membershipPurchasedAt: string | null;
  membershipDurationMonths: number | null;
  membershipPlan: string | null;
  membershipBillingCycle: string | null;
  createdAt: string | null;
};

type MembershipTier = "FREE" | "BASIC" | "PREMIUM" | "ELITE";

type DaddyProfilesPage = {
  items: DaddyProfile[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

const PAGE_SIZE = 12;

const membershipOptions: Array<{ value: MembershipTier; label: string }> = [
  { value: "FREE", label: "Sem plano" },
  { value: "BASIC", label: "Básico" },
  { value: "PREMIUM", label: "Premium" },
  { value: "ELITE", label: "Elite" },
];

function currentMembershipTier(profile: DaddyProfile): MembershipTier {
  const explicitTier = profile.membershipTier?.trim().toUpperCase();

  if (
    explicitTier === "BASIC" ||
    explicitTier === "PREMIUM" ||
    explicitTier === "ELITE"
  ) {
    return explicitTier;
  }

  if (profile.isPremium) return "PREMIUM";
  return "FREE";
}

function paginateLegacyProfiles(
  profiles: DaddyProfile[],
  requestedPage: number,
  search: string,
  profileType: string,
  membershipTier: string,
): DaddyProfilesPage {
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = profiles.filter((profile) => {
    const searchableText = [
      profile.username,
      profile.email,
      profile.city,
      profile.state,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    const identity = profileIdentityLabel("SUGAR_DADDY", profile.gender);
    const matchesIdentity =
      !profileType ||
      (profileType === "SUGAR_DADDY" && identity === "Sugar Daddy") ||
      (profileType === "SUGAR_MOMMY" && identity === "Sugar Mommy") ||
      (profileType === "SUGAR_PROVIDER_LGBTQIA" &&
        identity === "Sugar Daddy / Mommy");

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      matchesIdentity &&
      (!membershipTier || currentMembershipTier(profile) === membershipTier)
    );
  });
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const safePage = Math.min(requestedPage, Math.max(1, totalPages));
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    pagination: {
      page: safePage,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
}

export default function AdminPremiumPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DaddyProfile[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<DaddyProfilesPage["pagination"]>(
    {
      page: 1,
      pageSize: PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  );
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [profileType, setProfileType] = useState("");
  const [membershipTier, setMembershipTier] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");

  const loadProfiles = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (profileType) params.set("profileType", profileType);
      if (membershipTier) params.set("membershipTier", membershipTier);

      const response = await fetch(`/api/admin/premium-daddies?${params}`, {
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível carregar os perfis.",
        );
      }

      const data = Array.isArray(result)
        ? paginateLegacyProfiles(
            result as DaddyProfile[],
            page,
            search,
            profileType,
            membershipTier,
          )
        : (result as DaddyProfilesPage);
      setProfiles(data.items ?? []);
      setPagination(
        data.pagination ?? {
          page,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      );

      if (data.pagination && page !== data.pagination.page) {
        setPage(data.pagination.page);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os perfis.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [membershipTier, page, profileType, router, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchDraft.trim();
    setPage(1);
    if (nextSearch === search) {
      if (page === 1) void loadProfiles();
      return;
    }
    setSearch(nextSearch);
  }

  function clearFilters() {
    setSearchDraft("");
    setSearch("");
    setProfileType("");
    setMembershipTier("");
    setPage(1);
  }

  async function updateMembership(
    profile: DaddyProfile,
    membershipTier: MembershipTier,
  ) {
    setUpdatingKey(`${profile.id}:membership`);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/premium-daddies/${encodeURIComponent(profile.id)}/membership/${membershipTier.toLowerCase()}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível alterar o nível de membro.",
        );
      }

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? {
                ...item,
                isPremium: Boolean(result.isPremium),
                isPremiere: Boolean(result.isPremiere),
                membershipTier: result.membershipTier ?? null,
                membershipUntil: result.membershipUntil ?? null,
                membershipActive: false,
                membershipDaysRemaining: null,
              }
            : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível alterar o nível de membro.",
      );
    } finally {
      setUpdatingKey("");
    }
  }

  async function updatePremiere(profile: DaddyProfile) {
    setUpdatingKey(`${profile.id}:premiere`);
    setError("");

    try {
      const status = profile.isPremiere ? "regular" : "premiere";
      const response = await fetch(
        `/api/admin/premium-daddies/${encodeURIComponent(profile.id)}/${status}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível alterar o status Premiere.",
        );
      }

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? { ...item, isPremiere: Boolean(result.isPremiere) }
            : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível alterar o status Premiere.",
      );
    } finally {
      setUpdatingKey("");
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
            src="/brand/logo-primary.webp"
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
              onClick={() => void loadProfiles()}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
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
        <div className="flex flex-col gap-3 rounded-xl border border-black/8 bg-white p-5 shadow-[0_12px_35px_rgba(36,21,13,0.05)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Crown className="h-6 w-6 text-[var(--gold)]" />
              Níveis dos Sugar Daddies e Mommies
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-black/60">
              Pesquise perfis, acompanhe assinaturas e faça ajustes
              administrativos de forma organizada.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[color:color-mix(in_srgb,var(--gold)_10%,white)] px-4 py-3 text-[var(--gold)]">
            <UsersRound className="h-5 w-5" />
            <span className="text-sm font-bold">
              <strong className="text-lg">{pagination.totalItems}</strong>{" "}
              {pagination.totalItems === 1 ? "perfil" : "perfis"}
            </span>
          </div>
        </div>

        <form
          onSubmit={submitSearch}
          className="grid gap-3 rounded-xl border border-black/8 bg-white p-4 shadow-[0_12px_35px_rgba(36,21,13,0.05)] lg:grid-cols-[minmax(260px,1fr)_190px_190px_auto]"
        >
          <div className="flex relative w-full justify-center items-center mt-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Nome, e-mail, cidade ou estado"
              aria-label="Pesquisar Daddys e Mommies"
              className="h-11 rounded-lg border-black/10 bg-[#fbfaf7] pl-10 pr-10"
            />
            {searchDraft ? (
              <button
                type="button"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-black/40 hover:bg-black/5 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <label className="grid gap-1 text-xs font-bold text-black/55">
            Tipo de perfil
            <select
              value={profileType}
              onChange={(event) => {
                setProfileType(event.target.value);
                setPage(1);
              }}
              className="h-11 w-45 rounded-lg border border-black/10 bg-[#fbfaf7] px-3 text-sm font-semibold text-black outline-none focus:border-[var(--gold)]"
            >
              <option value="">Daddys e Mommies</option>
              <option value="SUGAR_DADDY">Sugar Daddies</option>
              <option value="SUGAR_MOMMY">Sugar Mommies</option>
              <option value="SUGAR_PROVIDER_LGBTQIA">
                Daddy / Mommy LGBTQIA+
              </option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-black/55">
            Plano atual
            <select
              value={membershipTier}
              onChange={(event) => {
                setMembershipTier(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-black/10 bg-[#fbfaf7] px-3 text-sm font-semibold text-black outline-none focus:border-[var(--gold)]"
            >
              <option value="">Todos os planos</option>
              {membershipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button
              type="submit"
              className="h-11 flex-1 rounded-lg bg-[var(--gold)] px-5 font-bold text-white hover:bg-[var(--cognac)]"
            >
              <Search className="h-4 w-4" /> Buscar
            </Button>
            {search || profileType || membershipTier ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Limpar filtros"
                aria-label="Limpar filtros"
                onClick={clearFilters}
                className="h-11 w-11 rounded-lg"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </form>

        {error ? (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 rounded-xl border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--gold)]" />
            Carregando perfis...
          </div>
        ) : profiles?.length === 0 ? (
          <div className="rounded-xl border border-[var(--platinum)] bg-white p-8 text-center text-sm font-bold">
            {search || profileType || membershipTier
              ? "Nenhum perfil corresponde aos filtros selecionados."
              : "Nenhum Sugar Daddy ou Sugar Mommy aprovado no momento."}
          </div>
        ) : (
          <div className="grid gap-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="flex flex-col gap-4 rounded-xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(20,17,14,0.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(20,17,14,0.1)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-bold">{profile.username}</h2>
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-800">
                      {profileIdentityLabel("SUGAR_DADDY", profile.gender)}
                    </span>
                    <span className="rounded-full border border-[var(--gold)] bg-black px-2.5 py-1 text-xs font-extrabold tracking-wider text-[var(--gold-soft)]">
                      {currentMembershipTier(profile) === "FREE"
                        ? "SEM PLANO"
                        : currentMembershipTier(profile)}
                    </span>
                    {profile.isPremiere ? (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-extrabold tracking-wider text-amber-900">
                        PREMIERE
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-black/60">
                    {profile.email}
                  </p>
                  <p className="text-xs text-black/50">
                    {[profile.city, profile.state].filter(Boolean).join(", ") ||
                      "Local não informado"}
                  </p>
                  {profile.membershipUntil ? (
                    <MembershipValidity profile={profile} />
                  ) : profile.premiumUntil ? (
                    <TemporaryPremiumValidity profile={profile} />
                  ) : currentMembershipTier(profile) !== "FREE" ? (
                    <p className="mt-2 text-xs font-bold text-black/45">
                      Nível administrativo sem vencimento automático.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:min-w-52">
                  <label className="grid gap-1 text-xs font-bold text-black/60">
                    {profile.membershipActive
                      ? "Assinatura automática"
                      : "Ajuste manual da assinatura"}
                    <select
                      value={currentMembershipTier(profile)}
                      disabled={
                        Boolean(updatingKey) || profile.membershipActive
                      }
                      onChange={(event) =>
                        void updateMembership(
                          profile,
                          event.target.value as MembershipTier,
                        )
                      }
                      className="h-11 rounded-sm border border-[var(--platinum)] bg-white px-3 text-sm font-bold text-black outline-none focus:border-[var(--gold)]"
                    >
                      {membershipOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(updatingKey)}
                    onClick={() => void updatePremiere(profile)}
                    className={
                      profile.isPremiere
                        ? "h-10 border-red-300 bg-red-50 text-xs font-extrabold text-red-800 hover:border-red-400 hover:bg-red-100"
                        : "h-10 border-amber-400 bg-amber-100 text-xs font-extrabold text-amber-950 hover:border-amber-500 hover:bg-amber-200"
                    }
                  >
                    {profile.isPremiere
                      ? "Remover Premiere"
                      : "Conceder Premiere"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
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
                aria-label="Página anterior"
                disabled={!pagination.hasPreviousPage || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="h-9 w-9 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-28 text-center text-xs font-bold text-black/65">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Próxima página"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((current) => current + 1)}
                className="h-9 w-9 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function TemporaryPremiumValidity({ profile }: { profile: DaddyProfile }) {
  const days = membershipDaysRemaining(profile.premiumUntil);
  const active = Boolean(days && days > 0 && profile.isPremium);

  return (
    <div
      className={`mt-3 flex max-w-xl items-start gap-2 rounded-lg border px-3 py-2 text-xs ${active ? "border-amber-300 bg-amber-50 text-amber-950" : "border-red-200 bg-red-50 text-red-900"}`}
    >
      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-extrabold">
          Premium temporário · {membershipRemainingLabel(days)}
        </p>
        <p className="mt-0.5 opacity-75">
          Benefício Premiere válido até{" "}
          {formatMembershipExpiry(profile.premiumUntil)}
        </p>
      </div>
    </div>
  );
}

function MembershipValidity({ profile }: { profile: DaddyProfile }) {
  const days =
    profile.membershipDaysRemaining ??
    membershipDaysRemaining(profile.membershipUntil);
  const active = profile.membershipActive && Boolean(days && days > 0);
  const duration = profile.membershipDurationMonths;

  return (
    <div
      className={`mt-3 flex max-w-xl items-start gap-2 rounded-lg border px-3 py-2 text-xs ${active ? (days !== null && days <= 7 ? "border-amber-300 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950") : "border-red-200 bg-red-50 text-red-900"}`}
    >
      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-extrabold">{membershipRemainingLabel(days)}</p>
        <p className="mt-0.5 opacity-75">
          Válido até {formatMembershipExpiry(profile.membershipUntil)}
        </p>
        {duration ? (
          <p className="mt-0.5 opacity-65">
            Última contratação: {duration} {duration === 1 ? "mês" : "meses"}
            {profile.membershipPurchasedAt
              ? ` · paga em ${new Intl.DateTimeFormat("pt-BR").format(new Date(profile.membershipPurchasedAt))}`
              : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
