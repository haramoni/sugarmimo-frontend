import { LucideIcon } from "lucide-react";

export default function StatePanel({
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
    <div className="grid min-h-80 place-items-center rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_90%,white)] p-6 text-center shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70">
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
      </div>
    </div>
  );
}
