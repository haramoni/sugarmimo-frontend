"use client";

import {
  Crown,
  Eye,
  Loader2,
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
import { PublicProfile } from "./types";

export default function BuscarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const canSearch = user?.role === "SUGAR_BABY";
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  useEffect(() => {
    if (!user || isApprovalPending || !canSearch) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

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
          return [];
        }

        if (!response.ok) {
          throw new Error(
            result?.message ?? "Nao foi possivel carregar a busca.",
          );
        }

        return Array.isArray(result) ? (result as PublicProfile[]) : [];
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setProfiles(result);
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
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canSearch, isApprovalPending, router, search, user]);

  const featuredCount = useMemo(
    () => profiles.filter((profile) => getProfilePhoto(profile)).length,
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
    setSearch(nextSearch);
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
                    Sugar daddies ativos
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

              <div className="mt-5 grid gap-2">
                <Metric
                  icon={ShieldCheck}
                  label="Perfis ativos"
                  value={String(profiles.length)}
                />
                <Metric
                  icon={Eye}
                  label="Com foto"
                  value={String(featuredCount)}
                />
                <Metric icon={SlidersHorizontal} label="Filtro" value="Livre" />
              </div>
            </aside>

            <section className="min-w-0">
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
                  description="Estamos buscando sugar daddies ativos para voce."
                  spin
                />
              ) : profiles.length === 0 ? (
                <StatePanel
                  icon={Search}
                  title="Nenhum perfil encontrado"
                  description="Tente buscar por outro nome, cidade ou estado."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
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
      title="Busca para sugar babies"
      description="Esta area mostra sugar daddies ativos para perfis Sugar Baby aprovados."
    />
  );
}
