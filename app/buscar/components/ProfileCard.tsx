import {
  BadgeCheck,
  Crown,
  HeartHandshake,
  MapPin,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  getAge,
  getCustomInterests,
  getLocation,
  getProfilePhoto,
} from "../profile-utils";
import type { PublicProfile } from "../types";
import { getRelationshipIntentLabel } from "../../lib/relationship-intent";
import styles from "./ProfileCard.module.css";

export default function ProfileCard({
  profile,
  onNavigate,
  eager = false,
}: {
  profile: PublicProfile;
  onNavigate?: () => void;
  eager?: boolean;
}) {
  const photo = getProfilePhoto(profile);
  const age = getAge(profile.birthDate);
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

  return (
    <article
      id={`profile-card-${profile.id}`}
      className={
        isPremiereDaddy
          ? styles.premiereCard
          : "min-w-0 overflow-hidden rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_18px_44px_rgba(20,17,14,0.12)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_24px_56px_rgba(20,17,14,0.16)]"
      }
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={[
          "block focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-emerald",
          isPremiereDaddy ? styles.premiereInner : "",
        ].join(" ")}
      >
        {isPremiereDaddy ? (
          <div className={styles.premiereHeader} aria-label="Perfil Premiere">
            <Crown aria-hidden="true" className={styles.premiereCrown} />
            <span>Premiere</span>
          </div>
        ) : null}
        <div
          className={[
            "relative bg-[linear-gradient(135deg,color-mix(in_srgb,var(--emerald)_18%,white),color-mix(in_srgb,var(--gold-soft)_35%,white))]",
            isPremiereDaddy ? styles.premierePhoto : "aspect-4/3",
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
                "h-full w-full object-cover",
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
        </div>

        {isPremiereDaddy ? (
          <div className={styles.premiereCrest} aria-hidden="true">
            <span>⚜</span>
          </div>
        ) : null}

        <div
          className={[
            "space-y-3 p-4",
            isPremiereDaddy ? styles.premiereDetails : "",
          ].join(" ")}
        >
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold tracking-tight text-black-jewel">
              {profile.username}
            </h2>
            <span className="mt-2 inline-flex max-w-full truncate rounded-full border border-ruby/22 bg-[color-mix(in_srgb,var(--ruby)_7%,white)] px-2.5 py-1 text-[0.68rem] font-extrabold text-ruby">
              {getRelationshipIntentLabel(profile.relationshipIntent)}
            </span>
          </div>

          <div className="grid gap-2 text-sm font-bold text-black-jewel/76">
            <span className="flex min-w-0 items-center gap-2">
              <HeartHandshake className="h-4 w-4 shrink-0 text-ruby" />
              <span className="truncate">
                {age ? `${age} anos` : "Idade não informada"}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-emerald" />
              <span className="truncate">
                {location || "Localização não informada"}
              </span>
            </span>
          </div>

          {interests.length > 0 && !isPremiereDaddy ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="min-w-0 rounded-full border border-gold/35 bg-[color-mix(in_srgb,var(--gold-soft)_22%,white)] px-2.5 py-1 text-xs font-extrabold text-black-jewel/78"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : null}
          {isPremiereDaddy ? (
            <div className={styles.premiereFlourish} aria-hidden="true">
              <span />
              <b>❖</b>
              <span />
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
