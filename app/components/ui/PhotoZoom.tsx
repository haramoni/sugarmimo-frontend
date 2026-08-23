"use client";

import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

export type PhotoZoomItem = {
  src: string;
  alt: string;
};

export function PhotoZoom({
  src,
  thumbnailSrc,
  alt,
  imageClassName = "h-full w-full object-cover",
  buttonClassName = "block h-full w-full cursor-zoom-in",
  gallery,
  initialIndex = 0,
}: {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  imageClassName?: string;
  buttonClassName?: string;
  gallery?: readonly PhotoZoomItem[];
  initialIndex?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const items = gallery?.length ? gallery : [{ src, alt }];
  const currentItem = items[activeIndex] ?? items[0];
  const hasNavigation = items.length > 1;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setScale(MIN_SCALE);
      } else if (event.key === "ArrowLeft" && hasNavigation) {
        setActiveIndex(
          (current) => (current - 1 + items.length) % items.length,
        );
        setScale(MIN_SCALE);
      } else if (event.key === "ArrowRight" && hasNavigation) {
        setActiveIndex((current) => (current + 1) % items.length);
        setScale(MIN_SCALE);
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
  }, [hasNavigation, isOpen, items.length]);

  function open() {
    setActiveIndex(Math.min(Math.max(initialIndex, 0), items.length - 1));
    setScale(MIN_SCALE);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setScale(MIN_SCALE);
  }

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
    setScale(MIN_SCALE);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % items.length);
    setScale(MIN_SCALE);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={buttonClassName}
        aria-label={`Ampliar ${alt}`}
      >
        {/* User uploads and authorized photo URLs should not use Next image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc ?? src}
          alt={alt}
          loading="lazy"
          className={imageClassName}
        />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Galeria de fotos: ${currentItem.alt}`}
              onClick={close}
              className="fixed inset-0 z-[200] flex flex-col bg-black/92 p-3 backdrop-blur-sm sm:p-5"
            >
              <div className="relative z-10 flex shrink-0 items-center justify-end gap-2">
                {hasNavigation ? (
                  <span className="mr-auto rounded-full bg-white/12 px-3 py-2 text-sm font-bold text-white">
                    {activeIndex + 1} / {items.length}
                  </span>
                ) : null}
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

              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-16">
                {hasNavigation ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showPrevious();
                    }}
                    aria-label="Foto anterior"
                    className="absolute left-2 z-20 grid h-12 w-12 place-items-center rounded-full bg-white/92 text-black shadow-lg transition hover:scale-105 hover:bg-gold sm:left-5 sm:h-14 sm:w-14"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                ) : null}

                <div className="flex h-full w-full items-center justify-center overflow-auto px-10 py-2 sm:px-6 sm:py-6">
                  {/* User uploads and authorized photo URLs should not use Next image optimization. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentItem.src}
                    alt={currentItem.alt}
                    onClick={(event) => event.stopPropagation()}
                    style={{ transform: `scale(${scale})` }}
                    className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                  />
                </div>

                {hasNavigation ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNext();
                    }}
                    aria-label="Próxima foto"
                    className="absolute right-2 z-20 grid h-12 w-12 place-items-center rounded-full bg-white/92 text-black shadow-lg transition hover:scale-105 hover:bg-gold sm:right-5 sm:h-14 sm:w-14"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
