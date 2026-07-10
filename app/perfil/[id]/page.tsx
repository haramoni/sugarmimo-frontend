"use client";

import {
  ArrowLeft,
  AtSign,
  BadgeCheck,
  Camera,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Navbar } from "../../components/ui/Navbar";
import { useAuth } from "../../components/AuthProvider";
import {
  formatContactValue,
  getAge,
  getContactHref,
  getCustomInterests,
  getGalleryPhotos,
  getLocation,
  getProfilePhoto,
  type ContactChannel,
} from "../../buscar/profile-utils";
import type { PublicProfile } from "../../buscar/types";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../ProfileApprovalGuard";

const contactOptions: {
  channel: ContactChannel;
  label: string;
  icon: LucideIcon;
}[] = [
  { channel: "whatsapp", label: "WhatsApp", icon: Phone },
  { channel: "telegram", label: "Telegram", icon: Send },
  { channel: "instagram", label: "Instagram", icon: AtSign },
];

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const identifier = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);
  const canView = user?.role === "SUGAR_BABY";
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  useEffect(() => {
    if (!identifier || !user || isApprovalPending || !canView) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/matches/${encodeURIComponent(identifier)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);

        if (response.status === 401) {
          router.replace("/login");
          return null;
        }

        if (!response.ok) {
          throw new Error(result?.message ?? "Perfil nao encontrado.");
        }

        return result as PublicProfile;
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setProfile(result);
        }
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Perfil nao encontrado.",
        );
        setProfile(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, identifier, isApprovalPending, router, user]);

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--gold-soft)_20%,transparent),transparent_30%),url('/wallpaper-marble.png')] bg-cover bg-fixed bg-center text-black-jewel">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/buscar")}
            className="mb-4 h-11 rounded-sm border border-emerald/24 bg-white/76 px-4 text-sm font-extrabold text-black-jewel hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {!canView ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfil privado"
              description="Esta area mostra sugar daddies ativos para perfis Sugar Baby aprovados."
            />
          ) : isLoading ? (
            <StatePanel
              icon={Loader2}
              title="Carregando perfil"
              description="Estamos preparando as informacoes publicas deste perfil."
              spin
            />
          ) : error || !profile ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfil nao encontrado"
              description={error || "Este perfil nao esta disponivel agora."}
            />
          ) : (
            <ProfileView profile={profile} />
          )}
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function ProfileView({ profile }: { profile: PublicProfile }) {
  const mainPhoto = getProfilePhoto(profile);
  const galleryPhotos = getGalleryPhotos(profile);
  const age = getAge(profile.birthDate);
  const location = getLocation(profile);
  const interests = getCustomInterests(profile);
  const visibleContacts = contactOptions
    .map((option) => ({
      ...option,
      value: profile[option.channel]?.trim() ?? "",
    }))
    .filter((contact) => contact.value);

  return (
    <div className="overflow-hidden rounded-lg border border-emerald/28 bg-[color:color-mix(in_srgb,var(--surface)_91%,white)] shadow-[0_28px_70px_rgba(0,55,44,0.15)] ring-1 ring-white/70 backdrop-blur-sm">
      <div className="grid min-w-0 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
        <aside className="bg-[linear-gradient(180deg,color-mix(in_srgb,var(--emerald)_10%,white),color-mix(in_srgb,var(--surface)_94%,white)_48%,color-mix(in_srgb,var(--gold-soft)_16%,white))] p-4 sm:p-6">
          <div className="relative mx-auto aspect-[4/5] max-w-88 overflow-hidden rounded-lg border-[3px] border-emerald/62 bg-white p-1 shadow-[0_20px_44px_rgba(0,55,44,0.18)]">
            <div className="h-full overflow-hidden rounded-md">
              {mainPhoto ? (
                // User uploads are data URLs and should not use Next image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainPhoto.dataUrl}
                  alt={`Foto de ${profile.username ?? "perfil"}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center bg-white/82 text-emerald">
                  <UserRound className="h-20 w-20" />
                </div>
              )}
            </div>
            <span className="absolute left-4 top-4 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/88 px-3 py-1 text-xs font-extrabold text-emerald shadow-[0_8px_18px_rgba(20,17,14,0.12)]">
              <BadgeCheck className="h-3.5 w-3.5" />
              Ativo
            </span>
          </div>

          <div className="mt-5 space-y-3 text-center">
            <h1 className="wrap-anywhere text-3xl font-extrabold tracking-tight text-black-jewel">
              {profile.username}
            </h1>
            <p className="mx-auto max-w-sm text-sm font-semibold leading-5 text-black-jewel/68">
              {profile.preferences?.introductionPhrase ||
                "Perfil verificado no SugarMimo"}
            </p>
            <Button
              asChild
              className="h-11 rounded-sm bg-emerald px-4 font-extrabold text-white hover:bg-emerald/84"
            >
              <Link href={`/chat?userId=${encodeURIComponent(profile.id)}`}>
                <MessageCircle className="h-4 w-4" />
                Mensagem
              </Link>
            </Button>
          </div>

          <dl className="mt-5 grid gap-2 text-sm font-bold text-black-jewel/76">
            <ProfileFact
              icon={HeartHandshake}
              label="Idade"
              value={age ? `${age} anos` : "Nao informada"}
            />
            <ProfileFact
              icon={MapPin}
              label="Local"
              value={location || "Nao informado"}
            />
            <ProfileFact
              icon={Ruler}
              label="Altura"
              value={
                profile.appearance?.heightCm
                  ? `${profile.appearance.heightCm} cm`
                  : "Nao informada"
              }
            />
          </dl>
        </aside>

        <section className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-7">
          <TextBlock
            title="Sobre"
            body={
              profile.preferences?.aboutMe ||
              "Este perfil ainda nao adicionou uma descricao publica."
            }
          />

          <TextBlock
            title="O que busca"
            body={
              profile.preferences?.lookingFor ||
              "As preferencias ainda nao foram preenchidas."
            }
          />

          {interests.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
                Interesses
              </h2>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-gold/35 bg-[color-mix(in_srgb,var(--gold-soft)_22%,white)] px-3 py-1 text-sm font-extrabold text-black-jewel/78"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <ContactSection contacts={visibleContacts} />

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
              Fotos
            </h2>
            {galleryPhotos.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {galleryPhotos.map((photo, index) => (
                  <div
                    key={photo.id ?? `${photo.sortOrder}-${index}`}
                    className="aspect-[1.18/1] overflow-hidden rounded-sm border-2 border-emerald/38 bg-white p-0.5 shadow-[0_12px_24px_rgba(0,55,44,0.12)]"
                  >
                    <div className="h-full overflow-hidden rounded-[0.18rem]">
                      {/* User uploads are data URLs and should not use Next image optimization. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.dataUrl}
                        alt={`Foto publica ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-28 items-center gap-3 rounded-sm border border-emerald/22 bg-white/70 px-4 py-3 text-sm font-bold text-black-jewel/64">
                <Camera className="h-5 w-5 shrink-0 text-emerald" />
                Nenhuma foto publica adicionada.
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
        {title}
      </h2>
      <p className="wrap-anywhere text-sm font-medium leading-6 text-black-jewel/78">
        {body}
      </p>
    </section>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(70px,0.8fr)_minmax(0,1fr)] items-center gap-2 rounded-sm border border-emerald/20 bg-white/74 px-3 py-2 shadow-[0_8px_18px_rgba(0,55,44,0.06)]">
      <Icon className="h-4 w-4 text-emerald" />
      <dt>{label}</dt>
      <dd className="min-w-0 truncate text-right text-black-jewel">{value}</dd>
    </div>
  );
}

function ContactSection({
  contacts,
}: {
  contacts: Array<{
    channel: ContactChannel;
    label: string;
    icon: LucideIcon;
    value: string;
  }>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
        Contatos
      </h2>

      {contacts.length > 0 ? (
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map(({ channel, label, icon: Icon, value }) => (
            <a
              key={channel}
              href={getContactHref(channel, value)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-16 min-w-0 items-center gap-3 rounded-sm border border-emerald/35 bg-white/80 px-3 py-2 text-sm font-bold text-black-jewel shadow-[0_10px_20px_rgba(0,55,44,0.08)] transition hover:border-emerald hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white shadow-[0_8px_16px_rgba(0,108,88,0.24)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase text-black-jewel/58">
                  {label}
                </span>
                <span className="block truncate">
                  {formatContactValue(channel, value)}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm font-medium leading-6 text-black-jewel/72">
          Este perfil ainda nao liberou contatos para voce.
        </p>
      )}
    </section>
  );
}

function StatePanel({
  icon: Icon,
  title,
  description,
  spin = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  spin?: boolean;
}) {
  return (
    <div className="grid min-h-96 place-items-center rounded-lg border border-emerald/24 bg-[color:color-mix(in_srgb,var(--surface)_90%,white)] p-6 text-center shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70">
      <div className="max-w-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald text-white shadow-[0_14px_32px_rgba(0,108,88,0.22)]">
          <Icon className={["h-6 w-6", spin ? "animate-spin" : ""].join(" ")} />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-black-jewel">
          {title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-black-jewel/68">
          {description}
        </p>
        <Button
          asChild
          className="mt-5 h-11 rounded-sm bg-emerald px-4 font-extrabold text-white hover:bg-emerald/84"
        >
          <Link href="/buscar">Voltar para busca</Link>
        </Button>
      </div>
    </div>
  );
}
