"use client";

import {
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AdminGalleryPhoto = {
  id: string;
  dataUrl: string;
  sortOrder: number;
  isPrivate: boolean;
};

export function AdminPhotoGallery({
  username,
  photos,
  onClose,
}: {
  username: string;
  photos: AdminGalleryPhoto[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(0, current - 1));
        setScale(1);
      } else if (event.key === "ArrowRight") {
        setIndex((current) => Math.min(photos.length - 1, current + 1));
        setScale(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, photos.length]);

  function showPhoto(nextIndex: number) {
    setIndex(nextIndex);
    setScale(1);
  }

  function handleTouchEnd(endX: number) {
    if (touchStartX.current === null) {
      return;
    }

    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (distance < -45 && index < photos.length - 1) {
      showPhoto(index + 1);
    } else if (distance > 45 && index > 0) {
      showPhoto(index - 1);
    }
  }

  if (!photo || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${username}`}
      className="fixed inset-0 z-[200] flex flex-col bg-black/94 p-3 backdrop-blur-sm sm:p-5"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          <p className="truncate font-bold">{username}</p>
          <p className="text-xs text-white/65">
            Foto {index + 1} de {photos.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={scale <= 1}
            onClick={() => setScale((current) => Math.max(1, current - 0.5))}
            aria-label="Diminuir zoom"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/12 transition hover:bg-white/22 disabled:opacity-35"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="min-w-12 text-center text-xs font-bold">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            disabled={scale >= 3}
            onClick={() => setScale((current) => Math.min(3, current + 0.5))}
            aria-label="Aumentar zoom"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/12 transition hover:bg-white/22 disabled:opacity-35"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar galeria"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-[var(--ruby)] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto py-3"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
        }}
      >
        <button
          type="button"
          disabled={index === 0}
          onClick={() => showPhoto(index - 1)}
          aria-label="Foto anterior"
          className="absolute left-0 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/16 text-white transition hover:bg-white/28 disabled:pointer-events-none disabled:opacity-20 sm:left-3"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        {/* ADMIN-authorized user upload; Next image optimization does not support data URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt={`Foto ${index + 1} de ${username}`}
          style={{ transform: `scale(${scale})` }}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
        />

        <button
          type="button"
          disabled={index === photos.length - 1}
          onClick={() => showPhoto(index + 1)}
          aria-label="Próxima foto"
          className="absolute right-0 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/16 text-white transition hover:bg-white/28 disabled:pointer-events-none disabled:opacity-20 sm:right-3"
        >
          <ChevronRight className="h-7 w-7" />
        </button>

        {photo.isPrivate ? (
          <span className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/72 px-3 py-1.5 text-xs font-bold text-white">
            <LockKeyhole className="h-3.5 w-3.5" />
            Foto privada
          </span>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto py-2">
          {photos.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => showPhoto(itemIndex)}
              aria-label={`Abrir foto ${itemIndex + 1}`}
              className={[
                "relative h-16 w-14 shrink-0 overflow-hidden rounded-sm border-2 transition",
                itemIndex === index
                  ? "border-[var(--gold)] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-90",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.dataUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              {item.isPrivate ? (
                <LockKeyhole className="absolute right-1 top-1 h-3.5 w-3.5 text-white drop-shadow" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
