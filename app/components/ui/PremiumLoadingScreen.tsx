import { Loader2 } from "lucide-react";

export function PremiumLoadingScreen({
  label = "Preparando sua experiência...",
}: {
  label?: string;
}) {
  return (
    <main
      className="premium-page-shell grid min-h-screen place-items-center px-5 text-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="premium-surface-card flex min-w-64 flex-col items-center rounded-2xl px-8 py-9">
        <span className="premium-icon-medallion grid h-14 w-14 place-items-center rounded-full">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
        <p className="mt-5 font-serif text-xl font-semibold text-luxury-ivory">
          SugarMimo
        </p>
        <p className="mt-1 text-sm font-semibold text-luxury-muted">{label}</p>
      </div>
    </main>
  );
}
