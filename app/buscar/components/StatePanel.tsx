import { LucideIcon } from "lucide-react";

export default function StatePanel({
  icon: Icon,
  title,
  description,
  spin = false,
  variant = "default",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  spin?: boolean;
  variant?: "default" | "luxuryDark";
}) {
  const isLuxuryDark = variant === "luxuryDark";

  return (
    <div
      className={[
        "grid min-h-80 place-items-center rounded-lg border p-6 text-center",
        isLuxuryDark
          ? "border-luxury-gold/45 bg-luxury-surface/92 text-luxury-ivory shadow-[0_22px_58px_rgba(0,0,0,0.32)]"
          : "border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_90%,white)] shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70",
      ].join(" ")}
    >
      <div className="max-w-sm">
        <span
          className={[
            "mx-auto grid h-14 w-14 place-items-center rounded-full",
            isLuxuryDark
              ? "border border-luxury-champagne/75 bg-[linear-gradient(145deg,var(--luxury-champagne),var(--luxury-gold-deep))] text-luxury-ink shadow-[0_0_24px_rgba(213,166,78,0.3)]"
              : "bg-emerald text-white shadow-[0_14px_32px_rgba(0,108,88,0.22)]",
          ].join(" ")}
        >
          <Icon className={["h-6 w-6", spin ? "animate-spin" : ""].join(" ")} />
        </span>
        <h2
          className={[
            "mt-4 text-2xl font-extrabold",
            isLuxuryDark ? "text-luxury-champagne" : "text-black-jewel",
          ].join(" ")}
        >
          {title}
        </h2>
        <p
          className={[
            "mt-2 text-sm font-semibold leading-6",
            isLuxuryDark ? "text-luxury-muted" : "text-black-jewel/68",
          ].join(" ")}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
