"use client";

import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

export function PhotoZoom({
  src,
  alt,
  imageClassName = "h-full w-full object-cover",
  buttonClassName = "block h-full w-full cursor-zoom-in",
}: {
  src: string;
  alt: string;
  imageClassName?: string;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      } else if (event.key === "+" || event.key === "=") {
        setScale((current) => Math.min(MAX_SCALE, current + SCALE_STEP));
      } else if (event.key === "-") {
        setScale((current) => Math.max(MIN_SCALE, current - SCALE_STEP));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    setScale(MIN_SCALE);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
        aria-label={`Ampliar ${alt}`}
      >
        {/* User uploads and authorized photo URLs should not use Next image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imageClassName} />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              onClick={close}
              className="fixed inset-0 z-[200] flex flex-col bg-black/92 p-3 backdrop-blur-sm sm:p-5"
            >
              <div className="relative z-10 flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setScale((current) =>
                      Math.max(MIN_SCALE, current - SCALE_STEP),
                    );
                  }}
                  disabled={scale <= MIN_SCALE}
                  aria-label="Diminuir zoom"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/22 disabled:opacity-35"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="min-w-14 text-center text-sm font-bold text-white">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setScale((current) =>
                      Math.min(MAX_SCALE, current + SCALE_STEP),
                    );
                  }}
                  disabled={scale >= MAX_SCALE}
                  aria-label="Aumentar zoom"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/22 disabled:opacity-35"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setScale(MIN_SCALE);
                  }}
                  aria-label="Restaurar zoom"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/22"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    close();
                  }}
                  aria-label="Fechar foto"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-ruby hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2 sm:p-6">
                {/* User uploads and authorized photo URLs should not use Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  onClick={(event) => event.stopPropagation()}
                  style={{ transform: `scale(${scale})` }}
                  className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
