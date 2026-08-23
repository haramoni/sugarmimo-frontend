"use client";

import {
  ArrowLeft,
  AtSign,
  Briefcase,
  Camera,
  Check,
  Cigarette,
  Eye,
  GraduationCap,
  Heart,
  HeartHandshake,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Crown,
  Ruler,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wine,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Navbar } from "../../components/ui/Navbar";
import { PhotoZoom } from "../../components/ui/PhotoZoom";
import { useAuth } from "../../components/AuthProvider";
import {
  formatContactValue,
  getAge,
  getContactHref,
  getCustomInterests,
  getGalleryPhotos,
  getPrivatePhotos,
  getLocation,
  getProfilePhoto,
  type ContactChannel,
} from "../../buscar/profile-utils";
import type { PublicProfile } from "../../buscar/types";
import { describeForProfile } from "../perfiloptions";
import { getRelationshipIntentLabel } from "../../lib/relationship-intent";
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
  const { user, isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const identifier = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);
  const canView = ["SUGAR_BABY", "SUGAR_DADDY"].includes(
    user?.role?.trim().toUpperCase() ?? "",
  );
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

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
          throw new Error(result?.message ?? "Perfil não encontrado.");
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
            : "Perfil não encontrado.",
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

  useEffect(() => {
    if (!profile?.id || profile.id === user?.id) {
      return;
    }

    void fetch(
      `/api/interactions/profile-visits/${encodeURIComponent(profile.id)}`,
      { method: "POST" },
    );
  }, [profile?.id, user?.id]);

  if (isAuthLoading || !user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_14%_12%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--gold-soft)_20%,transparent),transparent_30%),url('/wallpaper-marble.webp')] bg-cover bg-center text-black-jewel md:bg-fixed">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 h-11 rounded-sm border border-emerald/24 bg-white/76 px-4 text-sm font-extrabold text-black-jewel hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {!canView ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfil privado"
              description="Esta área está disponível para perfis Sugar Baby e Sugar Daddy."
            />
          ) : isLoading ? (
            <StatePanel
              icon={Loader2}
              title="Carregando perfil"
              description="Estamos preparando as informações públicas deste perfil."
              spin
            />
          ) : error || !profile ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfil não encontrado"
              description={error || "Este perfil não está disponível agora."}
            />
          ) : (
            <ProfileView
              profile={profile}
              viewerRole={user.role}
              viewerIsPremium={Boolean(user.isPremium)}
              viewerIsPremiere={Boolean(user.isPremiere)}
            />
          )}
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function ProfileView({
  profile,
  viewerRole,
  viewerIsPremium,
  viewerIsPremiere,
}: {
  profile: PublicProfile;
  viewerRole?: string | null;
  viewerIsPremium: boolean;
  viewerIsPremiere: boolean;
}) {
  const [interaction, setInteraction] = useState(
    profile.interaction ?? {
      liked: false,
      daddyLiked: false,
      babyLiked: false,
      contactsReleased: false,
    },
  );
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const mainPhoto = getProfilePhoto(profile);
  const galleryPhotos = getGalleryPhotos(profile);
  const privatePhotos = getPrivatePhotos(profile);
  const photoGallery = [...galleryPhotos, ...privatePhotos].map(
    (photo, index) => ({
      src: photo.dataUrl,
      alt:
        index < galleryPhotos.length
          ? `Foto pública ${index + 1} de ${profile.username ?? "perfil"}`
          : `Foto privada ${index - galleryPhotos.length + 1} de ${profile.username ?? "perfil"}`,
    }),
  );
  const age = getAge(profile.birthDate);
  const location = getLocation(profile);
  const interests = getCustomInterests(profile);
  const visibleContacts = contactOptions
    .map((option) => ({
      ...option,
      value: profile[option.channel]?.trim() ?? "",
    }))
    .filter((contact) => contact.value);
  const normalizedViewerRole = viewerRole?.trim().toUpperCase();
  const normalizedProfileRole = profile.role?.trim().toUpperCase();
  const isDaddyViewingBaby =
    normalizedViewerRole === "SUGAR_DADDY" &&
    normalizedProfileRole === "SUGAR_BABY";
  const isBabyViewingDaddy =
    normalizedViewerRole === "SUGAR_BABY" &&
    normalizedProfileRole === "SUGAR_DADDY";
  const viewerHasMessagingAccess = viewerIsPremium || viewerIsPremiere;
  const canLike = isDaddyViewingBaby && viewerHasMessagingAccess;
  const canBabyLike =
    isBabyViewingDaddy && Boolean(profile.isPremium || profile.isPremiere);
  const isPremiumDaddy =
    normalizedProfileRole === "SUGAR_DADDY" && Boolean(profile.isPremium);
  const isPremiereDaddy =
    normalizedProfileRole === "SUGAR_DADDY" && Boolean(profile.isPremiere);
  const showMessageButton = isDaddyViewingBaby || isBabyViewingDaddy;
  const canOpenChat = isDaddyViewingBaby || isBabyViewingDaddy;

  const isNewProfile = profile.createdAt
    ? new Date().getTime() - new Date(profile.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    : false;

  async function performInteraction(action: "daddy-like" | "baby-like") {
    setIsActing(true);
    setActionError("");

    try {
      const path =
        action === "daddy-like"
          ? `/api/interactions/likes/${encodeURIComponent(profile.id)}`
          : `/api/interactions/baby-likes/${encodeURIComponent(profile.id)}`;
      const response = await fetch(path, { method: "POST" });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível concluir a ação.");
      }

      setInteraction((current) => ({ ...current, ...result }));
    } catch (interactionError) {
      setActionError(
        interactionError instanceof Error
          ? interactionError.message
          : "Não foi possível concluir a ação.",
      );
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-emerald/28 bg-[color:color-mix(in_srgb,var(--surface)_91%,white)] shadow-[0_28px_70px_rgba(0,55,44,0.15)] ring-1 ring-white/70 backdrop-blur-sm">
      <div className="grid min-w-0 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
        <aside className="bg-[linear-gradient(180deg,color-mix(in_srgb,var(--emerald)_10%,white),color-mix(in_srgb,var(--surface)_94%,white)_48%,color-mix(in_srgb,var(--gold-soft)_16%,white))] p-4 sm:p-6">
          {isPremiereDaddy ? (
            <div className="mx-auto flex max-w-88 items-center justify-center gap-3 rounded-t-xl border-x border-t border-[#b99658] bg-[linear-gradient(135deg,#211912,#38291e_52%,#241a13)] px-4 py-3.5 font-serif text-xl font-semibold uppercase tracking-[0.13em] text-[#e4c787] shadow-[0_10px_22px_rgba(70,47,24,0.16)]">
              <Crown
                className="h-6 w-6 stroke-[1.5] text-[#d7b66f]"
                aria-hidden="true"
              />
              Premiere
            </div>
          ) : null}
          <div
            className={[
              "relative mx-auto aspect-[4/5] max-w-88 overflow-hidden bg-white p-1 shadow-[0_20px_44px_rgba(0,55,44,0.18)]",
              isPremiereDaddy
                ? "rounded-b-xl border-2 border-[#c4a266] ring-1 ring-[#ead6aa]"
                : "rounded-lg border-[3px] border-emerald/62",
            ].join(" ")}
          >
            <div className="h-full overflow-hidden rounded-md">
              {mainPhoto ? (
                <PhotoZoom
                  src={mainPhoto.dataUrl}
                  alt={`Foto de ${profile.username ?? "perfil"}`}
                  imageClassName="h-full w-full object-cover"
                  gallery={photoGallery}
                  initialIndex={0}
                />
              ) : (
                <div className="grid h-full place-items-center bg-white/82 text-emerald">
                  <UserRound className="h-20 w-20" />
                </div>
              )}
            </div>

            {profile.isOnline && (
              <span
                className={[
                  "absolute left-4 top-4 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-extrabold shadow-[0_8px_18px_rgba(20,17,14,0.12)]",
                  profile.isOnline ? "text-emerald" : "text-black-jewel/62",
                ].join(" ")}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald shadow-[0_0_0_3px_rgba(0,108,88,0.14)]" />
              </span>
            )}
            {isNewProfile || isPremiumDaddy || isPremiereDaddy ? (
              <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
                {isPremiereDaddy ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#c4a266] bg-[#fff8ea]/94 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8e6730] shadow-[0_6px_14px_rgba(70,47,24,0.14)]">
                    <Crown className="h-3.5 w-3.5 stroke-[1.5] text-[#b78945]" />
                    Premiere
                  </span>
                ) : null}
                {isPremiumDaddy ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-gold/55 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gold-soft)_42%,white),white)] px-3 py-1 text-xs font-extrabold text-black-jewel shadow-[0_8px_18px_rgba(20,17,14,0.12)]">
                    <Crown className="h-3.5 w-3.5 text-gold" />
                    Premium
                  </span>
                ) : null}
                {isNewProfile ? (
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-gold/45 bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)] px-3 py-1 text-xs font-extrabold text-black-jewel shadow-[0_8px_18px_rgba(20,17,14,0.12)]">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    Perfil Novo
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-3 text-center">
            <h1 className="wrap-anywhere text-3xl font-extrabold tracking-tight text-black-jewel">
              {profile.username}
            </h1>
            <div className="grid gap-2">
              {canLike ? (
                <Button
                  type="button"
                  disabled={Boolean(interaction.daddyLiked) || isActing}
                  onClick={() => void performInteraction("daddy-like")}
                  className="h-11 rounded-sm bg-ruby px-4 font-extrabold text-white hover:bg-ruby/84"
                >
                  {interaction.daddyLiked ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  {interaction.daddyLiked ? "Like Enviado" : "Dar Like"}
                </Button>
              ) : isDaddyViewingBaby ? (
                <Button
                  type="button"
                  disabled
                  className="h-auto min-h-11 rounded-sm bg-black-jewel/70 px-4 py-2 font-extrabold text-white"
                >
                  <Crown className="h-4 w-4 text-gold-soft" />
                  Seja Premiere para dar Like
                </Button>
              ) : null}

              {canBabyLike ? (
                <Button
                  type="button"
                  disabled={Boolean(interaction.babyLiked) || isActing}
                  onClick={() => void performInteraction("baby-like")}
                  className="h-11 rounded-sm bg-gold px-4 font-extrabold text-white hover:bg-gold/84"
                >
                  {interaction.babyLiked ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  {interaction.babyLiked
                    ? "Like e contatos enviados"
                    : "Curtir e liberar contatos"}
                </Button>
              ) : isBabyViewingDaddy ? null : null}

              {showMessageButton &&
                (canOpenChat ? (
                  <Button
                    asChild
                    className="h-11 rounded-sm bg-emerald px-4 font-extrabold text-white hover:bg-emerald/84"
                  >
                    <Link href={`/chat?with=${encodeURIComponent(profile.id)}`}>
                      <MessageCircle className="h-4 w-4" />
                      {isDaddyViewingBaby && !viewerHasMessagingAccess
                        ? "Enviar mensagem grátis"
                        : "Enviar mensagem"}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled
                    className="h-auto min-h-11 rounded-sm bg-emerald px-4 py-2 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {isDaddyViewingBaby && !viewerHasMessagingAccess
                      ? "Seja Premiere para enviar mensagem"
                      : "Disponível após o match"}
                  </Button>
                ))}

              {actionError ? (
                <p className="text-xs font-bold text-ruby">{actionError}</p>
              ) : null}
            </div>
          </div>

          <dl className="mt-5 grid gap-2 text-sm font-bold text-black-jewel/76">
            <ProfileFact
              icon={HeartHandshake}
              label="Idade"
              value={age ? `${age} anos` : "Não informada"}
            />
            <ProfileFact
              icon={Heart}
              label="Busca"
              value={getRelationshipIntentLabel(profile.relationshipIntent)}
            />
            <ProfileFact
              icon={MapPin}
              label="Local"
              value={location || "Não informada"}
            />
            <ProfileFact
              icon={Ruler}
              label="Altura"
              value={
                profile.appearance?.heightCm
                  ? `${profile.appearance.heightCm} cm`
                  : "Não informada"
              }
            />
          </dl>
        </aside>

        <section className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-7">
          <TextBlock
            title="Sobre"
            body={
              profile.preferences?.aboutMe ||
              "Este perfil ainda não adicionou uma descrição pública."
            }
          />

          <ProfileDetails profile={profile} />

          <TextBlock
            title="O que busca"
            body={
              profile.preferences?.lookingFor ||
              "As preferências ainda não foram preenchidas."
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
                      <PhotoZoom
                        src={photo.dataUrl}
                        alt={`Foto pública ${index + 1}`}
                        imageClassName="h-full w-full object-cover"
                        gallery={photoGallery}
                        initialIndex={index}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-28 items-center gap-3 rounded-sm border border-emerald/22 bg-white/70 px-4 py-3 text-sm font-bold text-black-jewel/64">
                <Camera className="h-5 w-5 shrink-0 text-emerald" />
                Nenhuma foto pública adicionada.
              </div>
            )}
          </section>

          {privatePhotos.length > 0 ? (
            <section className="space-y-3 rounded-md border border-gold/30 bg-[color-mix(in_srgb,var(--gold-soft)_12%,white)] p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gold" />
                <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
                  Fotos privadas
                </h2>
              </div>
              <p className="text-xs font-semibold text-black-jewel/62">
                Este perfil autorizou você a visualizar estas fotos.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {privatePhotos.map((photo, index) => (
                  <div
                    key={photo.id ?? `private-${index}`}
                    className="aspect-[1.18/1] overflow-hidden rounded-sm border-2 border-gold/45 bg-white p-0.5 shadow-[0_12px_24px_rgba(185,138,56,0.14)]"
                  >
                    <PhotoZoom
                      src={photo.dataUrl}
                      alt={`Foto privada ${index + 1}`}
                      imageClassName="h-full w-full rounded-[0.18rem] object-cover"
                      gallery={photoGallery}
                      initialIndex={galleryPhotos.length + index}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
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

function ProfileDetails({ profile }: { profile: PublicProfile }) {
  const preferences = profile.preferences?.preferences;
  const preferenceValue = (key: string) => {
    const value = preferences?.[key];
    return typeof value === "string" && value.trim()
      ? value.trim()
      : "Não informado";
  };
  const detailItems: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Tipo de corpo",
      value:
        describeForProfile(
          profile.appearance?.bodyType?.trim() ?? "",
          profile.gender,
        ) || "Não informado",
      icon: Users,
    },
    {
      label: "Tom de pele",
      value:
        describeForProfile(
          profile.appearance?.ethnicity?.trim() ?? "",
          profile.gender,
        ) || "Não informado",
      icon: Sparkles,
    },
    {
      label: "Cabelo",
      value: profile.appearance?.hairColor?.trim() || "Não informado",
      icon: Sparkles,
    },
    {
      label: "Cor dos olhos",
      value: profile.appearance?.eyeColor?.trim() || "Não informado",
      icon: Eye,
    },
    { label: "Fuma", value: preferenceValue("smoke"), icon: Cigarette },
    { label: "Bebe", value: preferenceValue("drink"), icon: Wine },
    {
      label: "Estado civil",
      value: describeForProfile(
        preferenceValue("relationship"),
        profile.gender,
      ),
      icon: HeartHandshake,
    },
    {
      label: "Escolaridade",
      value: preferenceValue("education"),
      icon: GraduationCap,
    },
    {
      label: "Profissão",
      value: describeForProfile(preferenceValue("occupation"), profile.gender),
      icon: Briefcase,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
        Informações do perfil
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {detailItems.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3 rounded-sm border border-emerald/22 bg-white/72 px-3 py-3 shadow-[0_8px_18px_rgba(0,55,44,0.06)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--emerald)_12%,white)] text-emerald">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-extrabold uppercase text-black-jewel/52">
                {label}
              </span>
              <span className="block truncate text-sm font-bold text-black-jewel/82">
                {value}
              </span>
            </span>
          </div>
        ))}
      </div>
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
          Este perfil ainda não liberou contatos para você.
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
