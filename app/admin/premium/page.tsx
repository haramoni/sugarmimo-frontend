"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Crown,
  LogOut,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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

export default function AdminPremiumPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DaddyProfile[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");

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
            Níveis dos Sugar Daddies e Mommies
          </h1>
          <p className="text-sm text-[color:color-mix(in_srgb,var(--black)_62%,transparent)]">
            As assinaturas pagas são ativadas e encerradas automaticamente. O
            seletor abaixo serve somente para ajustes administrativos.
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
            Nenhum Sugar Daddy ou Sugar Mommy ativo no momento.
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
