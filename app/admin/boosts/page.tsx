"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 12;

type BoostUser = {
  id: string;
  username: string;
  email: string;
  role: string | null;
  approvalStatus: string;
  accountStatus: string;
  boostCredits: number;
  boostedUntil: string | null;
};

type BoostUsersPage = {
  items: BoostUser[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
  };
};

export default function AdminBoostsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<BoostUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentTime] = useState(() => Date.now());

  const loadProfiles = useCallback(
    async (requestedPage: number) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(requestedPage),
          pageSize: String(PAGE_SIZE),
        });
        if (search) params.set("search", search);
        if (role) params.set("role", role);

        const response = await fetch(`/api/admin/boost-users?${params}`, {
          cache: "no-store",
        });
        const result = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 403) {
          router.push("/admin/login");
          return;
        }
        if (!response.ok) {
          throw new Error(
            result?.message ?? "Não foi possível carregar os usuários.",
          );
        }

        const data = result as BoostUsersPage;
        setProfiles(data.items ?? []);
        setPage(data.pagination?.page ?? requestedPage);
        setTotalItems(data.pagination?.totalItems ?? 0);
        setHasNextPage(Boolean(data.pagination?.hasNextPage));
      } catch (loadError) {
        setError(toMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [role, router, search],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles]);

  async function grantBoosts(profile: BoostUser, forcedQuantity?: number) {
    const quantity = forcedQuantity ?? quantities[profile.id] ?? 1;
    setUpdatingId(profile.id);
    setError("");
    setFeedback("");

    try {
      const response = await fetch(
        `/api/admin/boost-users/${encodeURIComponent(profile.id)}/grant`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        },
      );
      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível fornecer Boosts.");
      }

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? { ...item, boostCredits: Number(result.boostCredits) }
            : item,
        ),
      );
      setFeedback(
        `${quantity} ${quantity === 1 ? "Boost fornecido" : "Boosts fornecidos"} para ${profile.username}.`,
      );
    } catch (grantError) {
      setError(toMessage(grantError));
    } finally {
      setUpdatingId("");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchDraft.trim());
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
              onClick={() => void loadProfiles(page)}
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
              <Rocket className="h-6 w-6 text-[var(--gold)]" />
              Gerenciar Boosts
            </h1>
            <p className="max-w-2xl text-sm text-black/60">
              Forneça Boosts para Sugar Babies e Sugar Daddies. Cada ativação
              consome uma unidade e mantém o perfil em destaque por 24 horas.
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--gold)]">
            {totalItems} usuário(s)
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
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

          <label className="flex flex-col justify-center border border-[var(--platinum)] bg-white px-3 py-2 text-xs font-bold text-black/55">
            Tipo de perfil
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 h-8 bg-white text-sm font-semibold text-black outline-none"
            >
              <option value="">Todos</option>
              <option value="SUGAR_BABY">Sugar Babies</option>
              <option value="SUGAR_DADDY">Sugar Daddies</option>
            </select>
          </label>
        </div>

        {feedback ? (
          <p className="flex items-center gap-2 rounded-sm bg-[color:color-mix(in_srgb,var(--emerald)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--emerald)]">
            <ShieldCheck className="h-4 w-4" />
            {feedback}
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
            Carregando usuários...
          </div>
        ) : profiles.length === 0 ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const activeUntil = profile.boostedUntil
                ? new Date(profile.boostedUntil)
                : null;
              const isActive = Boolean(
                activeUntil && activeUntil.getTime() > currentTime,
              );
              const quantity = quantities[profile.id] ?? 1;

              return (
                <article
                  key={profile.id}
                  className="flex flex-col border border-[var(--platinum)] bg-white p-4 shadow-[0_10px_28px_rgba(20,17,14,0.07)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--gold)_14%,white)] text-[var(--gold)]">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-bold">{profile.username}</h2>
                      <p className="truncate text-xs text-black/50">
                        {profile.email}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[var(--emerald)]">
                        {profile.role === "SUGAR_BABY"
                          ? "Sugar Baby"
                          : "Sugar Daddy"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:color-mix(in_srgb,var(--gold)_15%,white)] px-2.5 py-1 text-xs font-extrabold text-[var(--gold)]">
                      {profile.boostCredits} saldo
                    </span>
                  </div>

                  <div className="my-4 min-h-12 border-y border-[var(--platinum)] py-3 text-xs">
                    {isActive && activeUntil ? (
                      <p className="flex items-center gap-1.5 font-bold text-[var(--emerald)]">
                        <Zap className="h-4 w-4 fill-current" />
                        Boost ativo até {formatDate(activeUntil)}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-black/50">
                        <Clock3 className="h-4 w-4" />
                        Sem Boost ativo
                      </p>
                    )}
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={quantity}
                        aria-label={`Quantidade para ${profile.username}`}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [profile.id]: Math.max(
                              1,
                              Math.min(100, Number(event.target.value) || 1),
                            ),
                          }))
                        }
                        className="h-10 rounded-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={updatingId === profile.id}
                        onClick={() => void grantBoosts(profile, 1)}
                        className="h-10 rounded-sm font-bold"
                      >
                        +1
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={updatingId === profile.id}
                        onClick={() => void grantBoosts(profile, 3)}
                        className="h-10 rounded-sm font-bold"
                      >
                        +3
                      </Button>
                    </div>
                    <Button
                      type="button"
                      disabled={updatingId === profile.id}
                      onClick={() => void grantBoosts(profile)}
                      className="min-h-11 w-full rounded-sm bg-[var(--gold)] font-bold text-white hover:bg-[color:color-mix(in_srgb,var(--gold)_86%,black)]"
                    >
                      {updatingId === profile.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Fornecer {quantity} {quantity === 1 ? "Boost" : "Boosts"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--platinum)] pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || page <= 1}
            onClick={() => void loadProfiles(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm font-bold text-black/55">Página {page}</span>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || !hasNextPage}
            onClick={() => void loadProfiles(page + 1)}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}
