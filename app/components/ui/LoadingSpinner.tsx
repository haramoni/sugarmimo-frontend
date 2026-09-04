import Image from "next/image";

type LoadingSpinnerProps = {
  label?: string;
  fullScreen?: boolean;
};

export function LoadingSpinner({
  label = "Carregando...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={
        fullScreen
          ? "flex min-h-[100svh] items-center justify-center bg-[var(--surface)] px-6"
          : "flex items-center justify-center px-6 py-10"
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid h-24 w-24 place-items-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-[var(--platinum)] border-t-[var(--gold)] shadow-[0_8px_28px_rgba(185,138,56,0.18)] [animation-duration:900ms]"
          />
          <div className="absolute inset-[7px] rounded-full bg-white shadow-inner" />
          <Image
            src="/brand/monogram-dark.webp"
            alt=""
            width={70}
            height={70}
            priority
            className="relative h-[58px] w-[58px] animate-pulse object-contain [animation-duration:1.8s]"
          />
        </div>
        <p className="text-sm font-bold tracking-wide text-[var(--gold)]">
          {label}
        </p>
      </div>
    </div>
  );
}
