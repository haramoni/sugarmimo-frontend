"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Crown, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DaddyProfile = {
  id: string;
  username: string;
  email: string;
  city: string | null;
  state: string | null;
  isPremium: boolean;
  createdAt: string | null;
};

export default function AdminPremiumPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DaddyProfile[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const loadProfiles = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/premium-daddies");

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

      setProfiles(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os perfis.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles]);

  async function updatePremium(profile: DaddyProfile) {
    setUpdatingId(profile.id);
    setError("");
    const status = profile.isPremium ? "standard" : "premium";

    try {
      const response = await fetch(
        `/api/admin/premium-daddies/${encodeURIComponent(profile.id)}/${status}`,
        { method: "PATCH" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível alterar o plano.");
      }

      setProfiles((current) =>
        current.map((item) =>
          item.id === profile.id
            ? { ...item, isPremium: Boolean(result.isPremium) }
            : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível alterar o plano.",
      );
    } finally {
      setUpdatingId("");
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
              onClick={() => router.push("/admin/approvals")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atualizar lista"
              onClick={() => void loadProfiles()}
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
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Crown className="h-6 w-6 text-[var(--gold)]" />
            Sugar Daddies Premium
          </h1>
          <p className="text-sm text-[color:color-mix(in_srgb,var(--black)_62%,transparent)]">
            Somente perfis Premium podem dar e receber likes de Sugar Babies.
          </p>
        </div>

        {error ? (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Carregando perfis...
          </div>
        ) : profiles?.length === 0 ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Nenhum Sugar Daddy ativo no momento.
          </div>
        ) : (
          <div className="grid gap-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="flex flex-col gap-4 border border-[var(--platinum)] bg-white p-4 shadow-[0_8px_24px_rgba(20,17,14,0.06)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-bold">{profile.username}</h2>
                    <span
                      className={
                        profile.isPremium
                          ? "rounded-full bg-[color-mix(in_srgb,var(--gold)_18%,white)] px-2.5 py-1 text-xs font-extrabold text-[var(--gold)]"
                          : "rounded-full bg-[var(--platinum)] px-2.5 py-1 text-xs font-extrabold text-black/60"
                      }
                    >
                      {profile.isPremium ? "PREMIUM" : "PADRÃO"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-black/60">
                    {profile.email}
                  </p>
                  <p className="text-xs text-black/50">
                    {[profile.city, profile.state].filter(Boolean).join(", ") ||
                      "Local não informado"}
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={updatingId === profile.id}
                  onClick={() => void updatePremium(profile)}
                  className={
                    profile.isPremium
                      ? "min-h-11 rounded-sm bg-black/70 font-bold text-white hover:bg-black/80"
                      : "min-h-11 rounded-sm bg-[var(--gold)] font-bold text-white hover:bg-[color-mix(in_srgb,var(--gold)_86%,black)]"
                  }
                >
                  {profile.isPremium ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Crown className="h-4 w-4" />
                  )}
                  {profile.isPremium ? "Remover Premium" : "Ativar Premium"}
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
