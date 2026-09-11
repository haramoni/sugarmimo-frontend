import { Activity } from "lucide-react";

export function LegendItem({
  icon: Icon,
  label,
  description,
  iconClass,
}: {
  icon: typeof Activity;
  label: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="flex min-h-[4.65rem] items-center gap-3 bg-luxury-night/95 px-4 py-3">
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-luxury-ivory">{label}</h3>
        <p className="mt-0.5 text-xs leading-4 text-luxury-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
