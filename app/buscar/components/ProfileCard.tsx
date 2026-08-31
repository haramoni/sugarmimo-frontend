"use client";

import {
  BadgeCheck,
  Crown,
  Heart,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
  Pin,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { profileIdentityLabel } from "@/app/lib/profileIdentity";
import {
  getAge,
  getCustomInterests,
  getLocation,
  getProfilePhoto,
} from "../profile-utils";
import type { PublicProfile } from "../types";
import styles from "./ProfileCard.module.css";

export default function ProfileCard({
  profile,
  onNavigate,
  eager = false,
  viewerRole,
  viewerIsPremium = false,
  viewerIsPremiere = false,
  onPinChange,
}: {
  profile: PublicProfile;
  onNavigate?: () => void;
  eager?: boolean;
  viewerRole?: string | null;
  viewerIsPremium?: boolean;
  viewerIsPremiere?: boolean;
  onPinChange?: (isPinned: boolean) => void;
}) {
  const [interaction, setInteraction] = useState(profile.interaction ?? {});
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [isPinned, setIsPinned] = useState(Boolean(profile.isPinned));
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const photo = getProfilePhoto(profile);
  const age = getAge(profile.birthDate, profile.age);
  const location = getLocation(profile);
  const interests = getCustomInterests(profile).slice(0, 3);
  const href = `/perfil/${encodeURIComponent(profile.username || profile.id)}`;
  const isNewProfile = profile.createdAt
    ? new Date().getTime() - new Date(profile.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    : false;
  const isPremiumDaddy =
    profile.role?.trim().toUpperCase() === "SUGAR_DADDY" && profile.isPremium;
  const isPremiereDaddy =
    profile.role?.trim().toUpperCase() === "SUGAR_DADDY" && profile.isPremiere;
  const isBoosted = profile.boostedUntil
    ? new Date(profile.boostedUntil).getTime() > new Date().getTime()
    : false;
  const normalizedViewerRole = viewerRole?.trim().toUpperCase();
  const normalizedProfileRole = profile.role?.trim().toUpperCase();
  const isDaddyViewingBaby =
    normalizedViewerRole === "SUGAR_DADDY" &&
    normalizedProfileRole === "SUGAR_BABY";
  const isBabyViewingDaddy =
    normalizedViewerRole === "SUGAR_BABY" &&
    normalizedProfileRole === "SUGAR_DADDY";
  const canMessage = isDaddyViewingBaby || isBabyViewingDaddy;
  const favoriteAction = isDaddyViewingBaby
    ? "daddy-like"
    : isBabyViewingDaddy && Boolean(profile.isPremium || profile.isPremiere)
      ? "baby-like"
      : null;
  const isFavorited = isDaddyViewingBaby
    ? Boolean(interaction.daddyLiked)
    : Boolean(interaction.babyLiked);
  const canFavorite =
    favoriteAction === "baby-like" ||
    (favoriteAction === "daddy-like" && (viewerIsPremium || viewerIsPremiere));

  async function favoriteProfile() {
    if (!favoriteAction || !canFavorite || isFavorited || isFavoriting) {
      return;
    }

    setIsFavoriting(true);
    setFavoriteError("");

    try {
      const path =
        favoriteAction === "daddy-like"
          ? `/api/interactions/likes/${encodeURIComponent(profile.id)}`
          : `/api/interactions/baby-likes/${encodeURIComponent(profile.id)}`;
      const response = await fetch(path, { method: "POST" });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível favoritar o perfil.",
        );
      }

      setInteraction((current) => ({ ...current, ...result }));
    } catch (error) {
      setFavoriteError(
        error instanceof Error
          ? error.message
          : "Não foi possível favoritar o perfil.",
      );
    } finally {
      setIsFavoriting(false);
    }
  }

  async function togglePin() {
    if (isUpdatingPin) {
      return;
    }

    setIsUpdatingPin(true);
    setPinError("");
    const nextPinned = !isPinned;

    try {
      const response = await fetch(
        `/api/pins/${encodeURIComponent(profile.id)}`,
        { method: nextPinned ? "POST" : "DELETE" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível atualizar o Pin.");
      }

      setIsPinned(nextPinned);
      onPinChange?.(nextPinned);
    } catch (error) {
      setPinError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o Pin.",
      );
    } finally {
      setIsUpdatingPin(false);
    }
  }

  return (
    <article
      id={`profile-card-${profile.id}`}
      className={
        isPremiereDaddy
          ? `${styles.premiereCard} relative`
          : "relative min-w-0 self-start overflow-hidden rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_18px_44px_rgba(20,17,14,0.12)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_24px_56px_rgba(20,17,14,0.16)]"
      }
    >
      <Link
        href={href}
        onClick={onNavigate}
        aria-label={`Ver perfil de ${profile.username ?? "usuário"}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald"
      />
      <div className={isPremiereDaddy ? styles.premiereInner : undefined}>
        {isPremiereDaddy ? (
          <div className={styles.premiereHeader} aria-label="Perfil Premiere">
            <Crown aria-hidden="true" className={styles.premiereCrown} />
            <span>Premiere</span>
          </div>
        ) : null}
        <div
          className={[
            "relative aspect-[5/7] overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--emerald)_18%,white),color-mix(in_srgb,var(--gold-soft)_35%,white))]",
            isPremiereDaddy ? styles.premierePhoto : "",
          ].join(" ")}
        >
          {photo ? (
            // User uploads are data URLs and should not use Next image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.dataUrl}
              alt={`Foto de ${profile.username ?? "perfil"}`}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              decoding="async"
              className={[
                "block h-full w-full object-cover",
                isPremiereDaddy ? styles.premiereImage : "",
              ].join(" ")}
            />
          ) : (
            <div className="grid h-full place-items-center text-emerald">
              <UserRound className="h-16 w-16" />
            </div>
          )}
          {isPremiereDaddy ? (
            <span className={styles.premiereVignette} aria-hidden="true" />
          ) : null}
          {profile.isOnline && !isPremiereDaddy && (
            <span
              aria-label={profile.isOnline ? "Online agora" : "Perfil ativo"}
              title={profile.isOnline ? "Online agora" : "Perfil ativo"}
              className={[
                "absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_8px_18px_rgba(20,17,14,0.12)] backdrop-blur-sm",
                profile.isOnline ? "text-emerald" : "text-black-jewel/62",
              ].join(" ")}
            >
              <BadgeCheck aria-hidden="true" className="h-5 w-5" />
            </span>
          )}

          {!isPremiereDaddy && (isNewProfile || isPremiumDaddy || isBoosted) ? (
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {isBoosted ? (
                <span
                  aria-label="Perfil com Boost ativo"
                  title="Perfil com Boost ativo"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-gold text-white shadow-[0_8px_18px_rgba(185,138,56,0.28)]"
                >
                  <Zap aria-hidden="true" className="h-5 w-5 fill-current" />
                </span>
              ) : null}
              {isPremiumDaddy ? (
                <span
                  aria-label="Perfil Premium"
                  title="Perfil Premium"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/55 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gold-soft)_42%,white),white)] text-gold shadow-[0_8px_18px_rgba(20,17,14,0.12)] backdrop-blur-sm"
                >
                  <Crown aria-hidden="true" className="h-5 w-5" />
                </span>
              ) : null}
              {isNewProfile ? (
                <span
                  aria-label="Perfil novo"
                  title="Perfil novo"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)] text-gold shadow-[0_8px_18px_rgba(20,17,14,0.12)] backdrop-blur-sm"
                >
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </span>
              ) : null}
            </div>
          ) : null}

          <div
            className={[
              styles.profileOverlay,
              isPremiereDaddy ? styles.premiereOverlay : "",
            ].join(" ")}
          >
            <h2 className={styles.profileName}>{profile.username}</h2>

            <span className="inline-flex w-fit rounded-full border border-white/45 bg-black/35 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm">
              {profileIdentityLabel(profile.role, profile.gender)}
            </span>

            <div className={styles.profileMeta}>
              <span className={styles.profileMetaItem}>
                <HeartHandshake aria-hidden="true" />
                <span className="truncate">
                  {age ? `${age} anos` : "Idade não informada"}
                </span>
              </span>
              <span className={styles.profileMetaItem}>
                <MapPin aria-hidden="true" />
                <span className="truncate">
                  {location || "Localização não informada"}
                </span>
              </span>
            </div>

            {interests.length > 0 && !isPremiereDaddy ? (
              <div className={styles.interestList}>
                {interests.map((interest) => (
                  <span key={interest} className={styles.profileInterest}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void togglePin()}
              disabled={isUpdatingPin}
              aria-pressed={isPinned}
              aria-label={isPinned ? "Remover dos Pins" : "Pinar perfil"}
              title={isPinned ? "Remover dos Pins" : "Pinar perfil"}
              className={[
                "inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border bg-white/88 shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60",
                isPinned
                  ? "border-gold/60 text-gold"
                  : "border-white/70 text-black-jewel/72",
              ].join(" ")}
            >
              {isUpdatingPin ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Pin
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill={isPinned ? "currentColor" : "none"}
                />
              )}
            </button>

            {canMessage ? (
              <>
                {favoriteAction ? (
                  <button
                    type="button"
                    onClick={() => void favoriteProfile()}
                    disabled={!canFavorite || isFavorited || isFavoriting}
                    aria-label={
                      isFavorited
                        ? "Perfil favoritado"
                        : canFavorite
                          ? "Favoritar perfil"
                          : "Favoritar disponível para assinantes"
                    }
                    title={
                      isFavorited
                        ? "Perfil favoritado"
                        : canFavorite
                          ? "Favoritar"
                          : "Disponível para perfis Premium e Premiere"
                    }
                    className={[
                      "inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border bg-white/88 shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ruby disabled:cursor-not-allowed disabled:opacity-60",
                      isFavorited
                        ? "border-ruby/45 text-ruby"
                        : "border-white/70 text-black-jewel/72",
                    ].join(" ")}
                  >
                    {isFavoriting ? (
                      <Loader2
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                      />
                    ) : (
                      <Heart
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill={isFavorited ? "currentColor" : "none"}
                      />
                    )}
                  </button>
                ) : null}

                <Link
                  href={`/chat?with=${encodeURIComponent(profile.id)}`}
                  onClick={onNavigate}
                  aria-label={`Enviar mensagem para ${profile.username ?? "este perfil"}`}
                  title="Enviar mensagem"
                  className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/70 bg-white/88 text-emerald shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                </Link>
              </>
            ) : null}
          </div>

          {favoriteError || pinError ? (
            <span className="sr-only" role="status">
              {favoriteError || pinError}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
