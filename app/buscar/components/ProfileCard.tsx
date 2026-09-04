"use client";

import {
  Activity,
  BadgeCheck,
  Crown,
  Gem,
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
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { resolveProfileFrame } from "@/app/lib/membership";
import { getProviderProfilePlaceholder } from "@/app/lib/profileIdentity";
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
  onPinChange,
  variant = "default",
}: {
  profile: PublicProfile;
  onNavigate?: () => void;
  eager?: boolean;
  viewerRole?: string | null;
  viewerIsPremium?: boolean;
  onPinChange?: (isPinned: boolean) => void;
  variant?: "default" | "active" | "searchDark";
}) {
  const [interaction, setInteraction] = useState(profile.interaction ?? {});
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [isPinned, setIsPinned] = useState(Boolean(profile.isPinned));
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const photo = getProfilePhoto(profile);
  const providerPlaceholder = getProviderProfilePlaceholder(
    profile.role,
    profile.gender,
  );
  const age = getAge(profile.birthDate, profile.age);
  const location = getLocation(profile);
  const interests = getCustomInterests(profile).slice(0, 3);
  const href = `/perfil/${encodeURIComponent(profile.username || profile.id)}`;
  const isNewProfile = profile.createdAt
    ? new Date().getTime() - new Date(profile.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    : false;
  const membershipTier = resolveProfileFrame(profile);
  const isBasicMember = membershipTier === "BASIC";
  const isPremiumMember = membershipTier === "PREMIUM";
  const isEliteMember = membershipTier === "ELITE";
  const isPremiereMember = membershipTier === "PREMIERE";
  const isActiveVariant = variant === "active";
  const isSearchDarkVariant = variant === "searchDark";
  const isLuxuryVariant = isActiveVariant || isSearchDarkVariant;
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
    : isBabyViewingDaddy && Boolean(profile.isPremium)
      ? "baby-like"
      : null;
  const isFavorited = isDaddyViewingBaby
    ? Boolean(interaction.daddyLiked)
    : Boolean(interaction.babyLiked);
  const canFavorite =
    favoriteAction === "baby-like" ||
    (favoriteAction === "daddy-like" && viewerIsPremium);

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
      className={[
        styles.uniformCard,
        isSearchDarkVariant ? styles.searchCardSize : styles.standardCardSize,
        isPremiereMember
          ? `${styles.premiereCard} relative`
          : isLuxuryVariant
            ? styles.luxuryCard
            : "relative min-w-0 self-start overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_18px_44px_rgba(20,17,14,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(20,17,14,0.16)]",
        isEliteMember ? styles.eliteCard : "",
        isPremiumMember ? styles.premiumCard : "",
      ].join(" ")}
    >
      <Link
        href={href}
        onClick={onNavigate}
        aria-label={`Ver perfil de ${profile.username ?? "usuário"}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald"
      />
      <div
        className={
          isPremiereMember ? styles.premiereInner : styles.standardInner
        }
      >
        {isPremiereMember ? (
          <div className={styles.premiereHeader} aria-label="Membro Premiere">
            <Crown aria-hidden="true" className={styles.premiereCrown} />
            <span>Premiere</span>
          </div>
        ) : null}
        <div
          className={[
            styles.cardPhoto,
            "relative overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--emerald)_18%,white),color-mix(in_srgb,var(--gold-soft)_35%,white))]",
            isLuxuryVariant ? styles.luxuryPhoto : "",
            isSearchDarkVariant ? styles.searchPhoto : "",
            isPremiereMember ? styles.premierePhoto : "",
            isEliteMember ? styles.elitePhoto : "",
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
                isPremiereMember ? styles.premiereImage : "",
              ].join(" ")}
            />
          ) : providerPlaceholder ? (
            <Image
              src={providerPlaceholder}
              alt={`Imagem padrão de ${profile.username ?? "perfil"}`}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 320px"
              className={[
                "object-cover",
                isPremiereMember ? styles.premiereImage : "",
              ].join(" ")}
            />
          ) : (
            <div className="grid h-full place-items-center text-emerald">
              <UserRound className="h-16 w-16" />
            </div>
          )}
          {isPremiereMember ? (
            <span className={styles.premiereVignette} aria-hidden="true" />
          ) : null}
          {isActiveVariant ? (
            <span
              aria-label={profile.isOnline ? "Online agora" : "Perfil ativo"}
              title={
                profile.isOnline ? "Online agora" : "Ativo nos últimos 7 dias"
              }
              className={styles.activeStatus}
            >
              <Activity aria-hidden="true" />
            </span>
          ) : profile.isOnline ? (
            <span
              aria-label={profile.isOnline ? "Online agora" : "Perfil ativo"}
              title={profile.isOnline ? "Online agora" : "Perfil ativo"}
              className={[
                "absolute top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-[0_8px_18px_rgba(20,17,14,0.12)] backdrop-blur-sm",
                "left-3",
                isEliteMember
                  ? styles.eliteStatusBadge
                  : isSearchDarkVariant
                    ? "border-luxury-gold/70 bg-luxury-black/82 text-luxury-champagne"
                    : profile.isOnline
                      ? "border-white/70 bg-white/90 text-emerald"
                      : "border-white/70 bg-white/90 text-black-jewel/62",
              ].join(" ")}
            >
              <BadgeCheck aria-hidden="true" className="h-5 w-5" />
            </span>
          ) : null}

          {isBasicMember ||
          isPremiumMember ||
          isEliteMember ||
          (!isActiveVariant && (isNewProfile || isBoosted)) ? (
            <div
              className={[
                "absolute top-3 flex items-center gap-2",
                isActiveVariant ? "right-[3.5rem]" : "right-3",
              ].join(" ")}
            >
              {isBoosted && !isActiveVariant ? (
                <span
                  aria-label="Perfil com Boost ativo"
                  title="Perfil com Boost ativo"
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-[0_8px_18px_rgba(185,138,56,0.28)]",
                    isEliteMember
                      ? styles.eliteStatusBadge
                      : isSearchDarkVariant
                        ? "border-luxury-champagne bg-[linear-gradient(145deg,var(--luxury-champagne),var(--luxury-gold))] text-luxury-ink"
                        : "border-gold/60 bg-gold text-white",
                  ].join(" ")}
                >
                  <Zap aria-hidden="true" className="h-5 w-5 fill-current" />
                </span>
              ) : null}
              {isPremiumMember ? (
                <span
                  aria-label="Perfil Premium"
                  title="Perfil Premium"
                  className={styles.premiumBadge}
                >
                  <Crown aria-hidden="true" />
                  <strong>PREMIUM</strong>
                </span>
              ) : null}
              {isEliteMember ? (
                <span
                  aria-label="Perfil Elite"
                  title="Perfil Elite"
                  className={styles.eliteBadge}
                >
                  <Gem aria-hidden="true" />
                  <strong>ELITE</strong>
                </span>
              ) : null}
              {isBasicMember ? (
                <span
                  aria-label="Membro Básico"
                  title="Membro Básico"
                  className={styles.basicBadge}
                >
                  <Crown aria-hidden="true" />
                  <strong>MEMBRO</strong>
                </span>
              ) : null}
              {isNewProfile && !isActiveVariant ? (
                <span
                  aria-label="Perfil novo"
                  title="Perfil novo"
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-[0_8px_18px_rgba(20,17,14,0.12)] backdrop-blur-sm",
                    isEliteMember
                      ? styles.eliteStatusBadge
                      : isSearchDarkVariant
                        ? "border-luxury-champagne bg-[linear-gradient(145deg,var(--luxury-champagne),var(--luxury-gold))] text-luxury-ink"
                        : "border-gold/45 bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)] text-gold",
                  ].join(" ")}
                >
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </span>
              ) : null}
            </div>
          ) : null}

          <div
            className={[
              styles.profileOverlay,
              isPremiereMember ? styles.premiereOverlay : "",
              isLuxuryVariant ? styles.luxuryOverlay : "",
              isSearchDarkVariant ? styles.searchOverlay : "",
            ].join(" ")}
          >
            <h2
              className={[
                styles.profileName,
                isEliteMember ? styles.eliteProfileName : "",
              ].join(" ")}
            >
              {profile.username}
            </h2>

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

            {interests.length > 0 && !isPremiereMember && !isLuxuryVariant ? (
              <div className={styles.interestList}>
                {interests.map((interest) => (
                  <span key={interest} className={styles.profileInterest}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className={[
              "absolute bottom-3 right-3 z-20 flex items-center gap-1.5",
              isEliteMember ? styles.eliteActions : "",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => void togglePin()}
              disabled={isUpdatingPin}
              aria-pressed={isPinned}
              aria-label={isPinned ? "Remover dos Pins" : "Pinar perfil"}
              title={isPinned ? "Remover dos Pins" : "Pinar perfil"}
              className={[
                "inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60",
                isEliteMember
                  ? styles.eliteAction
                  : isLuxuryVariant
                    ? isPinned
                      ? "border-luxury-champagne bg-luxury-gold text-luxury-ink hover:bg-luxury-champagne"
                      : "border-luxury-gold/80 bg-luxury-black/78 text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
                    : isPinned
                      ? "border-gold/60 bg-white/88 text-gold hover:bg-white"
                      : "border-white/70 bg-white/88 text-black-jewel/72 hover:bg-white",
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
                      "inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ruby disabled:cursor-not-allowed disabled:opacity-60",
                      isEliteMember
                        ? styles.eliteAction
                        : isLuxuryVariant
                          ? isFavorited
                            ? "border-ruby/70 bg-luxury-black/82 text-[#ff9eae]"
                            : "border-luxury-gold/80 bg-luxury-black/78 text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
                          : isFavorited
                            ? "border-ruby/45 bg-white/88 text-ruby hover:bg-white"
                            : "border-white/70 bg-white/88 text-black-jewel/72 hover:bg-white",
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
                  className={[
                    "inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border shadow-[0_7px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald",
                    isEliteMember
                      ? styles.eliteAction
                      : isLuxuryVariant
                        ? "border-luxury-gold/80 bg-luxury-black/78 text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
                        : "border-white/70 bg-white/88 text-emerald hover:bg-white",
                  ].join(" ")}
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                </Link>
              </>
            ) : null}
          </div>

          {isEliteMember ? (
            <div className={styles.eliteFooter} aria-label="Membro Elite">
              <span aria-hidden="true">◆</span>
              <strong>MEMBRO ELITE</strong>
              <span aria-hidden="true">◆</span>
            </div>
          ) : null}

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
