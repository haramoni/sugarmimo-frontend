import {
  BadgeCheck,
  HeartHandshake,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  getAge,
  getCustomInterests,
  getLocation,
  getProfilePhoto,
} from "../profile-utils";
import type { PublicProfile } from "../types";

export default function ProfileCard({ profile }: { profile: PublicProfile }) {
  const photo = getProfilePhoto(profile);
  const age = getAge(profile.birthDate);
  const location = getLocation(profile);
  const interests = getCustomInterests(profile).slice(0, 3);
  const href = `/perfil/${encodeURIComponent(profile.username || profile.id)}`;

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_18px_44px_rgba(20,17,14,0.12)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_24px_56px_rgba(20,17,14,0.16)]">
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-emerald"
      >
        <div className="relative aspect-4/3 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--emerald)_18%,white),color-mix(in_srgb,var(--gold-soft)_35%,white))]">
          {photo ? (
            // User uploads are data URLs and should not use Next image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.dataUrl}
              alt={`Foto de ${profile.username ?? "perfil"}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-emerald">
              <UserRound className="h-16 w-16" />
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/86 px-3 py-1 text-xs font-extrabold text-emerald shadow-[0_8px_18px_rgba(20,17,14,0.12)]">
            <BadgeCheck className="h-3.5 w-3.5" />
            Ativo
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold tracking-tight text-black-jewel">
              {profile.username}
            </h2>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-black-jewel/68">
              {profile.preferences?.introductionPhrase ||
                "Perfil verificado no SugarMimo"}
            </p>
          </div>

          <div className="grid gap-2 text-sm font-bold text-black-jewel/76">
            <span className="flex min-w-0 items-center gap-2">
              <HeartHandshake className="h-4 w-4 shrink-0 text-ruby" />
              <span className="truncate">
                {age ? `${age} anos` : "Idade nao informada"}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-emerald" />
              <span className="truncate">
                {location || "Localizacao nao informada"}
              </span>
            </span>
          </div>

          {interests.length > 0 ? (
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
        </div>
      </Link>
    </article>
  );
}
