"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LogOut, RefreshCw, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");

  const loadProfiles = useCallback(async () => {
    const token = localStorage.getItem("sugarmimo:admin-token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/pending-babies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sugarmimo:admin-token");
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível carregar perfis.");
      }

      setProfiles(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar perfis.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfiles(), 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfiles]);

  async function reviewProfile(id: string, action: "approve" | "reject") {
    const token = localStorage.getItem("sugarmimo:admin-token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setReviewingId(id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/admin/profiles/${id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível revisar o perfil.");
      }

      setProfiles((currentProfiles) =>
        currentProfiles.filter((profile) => profile.id !== id),
      );
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

  function logout() {
    localStorage.removeItem("sugarmimo:admin-token");
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
              aria-label="Atualizar lista"
              onClick={() => void loadProfiles()}
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
            {profiles.length} pendente(s)
          </span>
        </div>

        {error && (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Carregando perfis...
          </div>
        ) : profiles.length === 0 ? (
          <div className="border border-[var(--platinum)] bg-white p-6 text-sm font-bold">
            Nenhum perfil pendente no momento.
          </div>
        ) : (
          <div className="grid gap-5">
            {profiles.map((profile) => (
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
                    <ProfileField
                      label="Instagram"
                      value={profile.instagram}
                    />
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
