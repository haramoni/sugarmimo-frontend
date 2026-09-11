"use client";

import { Activity, Crown, Gem, Info, Pin, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LegendItem } from "./LegendItem";

export function ProfileSymbolsMenu() {
  const [clickedOpen, setClickedOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = clickedOpen || hovered;

  useEffect(() => {
    if (!clickedOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setClickedOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setClickedOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [clickedOpen]);

  return (
    <div
      ref={menuRef}
      className="absolute right-3 top-3 z-[60] sm:right-6 sm:top-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHovered(false);
        }
      }}
    >
      <button
        type="button"
        aria-label="Entenda os símbolos dos perfis"
        aria-expanded={isOpen}
        aria-controls="profile-symbols-menu"
        onClick={() => {
          if (isOpen) {
            setHovered(false);
            setClickedOpen(false);
          } else {
            setClickedOpen(true);
          }
        }}
        className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-luxury-gold/70 bg-luxury-black/75 text-luxury-champagne shadow-[0_0_20px_rgba(213,166,78,0.22),0_10px_24px_rgba(0,0,0,0.38)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-luxury-champagne sm:h-12 sm:w-12"
      >
        <Info className="h-5 w-5" aria-hidden="true" />
      </button>
      <aside
        id="profile-symbols-menu"
        aria-labelledby="profile-symbols-title"
        aria-hidden={!isOpen}
        className={[
          "absolute right-0 top-11 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-luxury-gold/55 bg-[linear-gradient(145deg,var(--luxury-surface-raised),var(--luxury-night))] shadow-[0_24px_70px_rgba(0,0,0,0.58),0_0_28px_rgba(213,166,78,0.13)] transition duration-150 sm:top-12",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        ].join(" ")}
      >
        <div className="border-b border-luxury-gold/25 px-4 py-3">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-luxury-gold">
            Guia dos perfis
          </p>
          <h2
            id="profile-symbols-title"
            className="mt-1 font-serif text-xl font-semibold text-luxury-champagne"
          >
            Entenda os símbolos
          </h2>
        </div>
        <div className="max-h-[min(32rem,65dvh)] overflow-y-auto bg-luxury-gold/10 overscroll-contain">
          <LegendItem
            icon={Zap}
            label="Boost"
            description="Perfil com mais destaque por tempo limitado."
            iconClass="border-luxury-champagne bg-luxury-gold text-luxury-ink"
          />
          <LegendItem
            icon={Activity}
            label="Online agora"
            description="A pessoa está conectada neste momento."
            iconClass="border-emerald-200 bg-emerald-600 text-white shadow-[0_0_14px_rgba(34,197,94,0.35)]"
          />
          <LegendItem
            icon={Activity}
            label="Ativo recentemente"
            description="Interagiu na SugarMimo nos últimos 7 dias."
            iconClass="border-luxury-champagne bg-luxury-champagne text-luxury-ink"
          />
          <LegendItem
            icon={Crown}
            label="Membro"
            description="Perfil com plano de entrada da comunidade."
            iconClass="border-[#d7a66a] bg-[#9a5d31] text-white"
          />
          <LegendItem
            icon={Crown}
            label="Premium"
            description="Perfil com assinatura Premium ativa."
            iconClass="border-luxury-champagne bg-[linear-gradient(145deg,var(--luxury-champagne),var(--luxury-gold))] text-luxury-ink"
          />
          <LegendItem
            icon={Gem}
            label="Elite"
            description="Perfil com assinatura Elite ativa."
            iconClass="border-cyan-200 bg-[linear-gradient(145deg,#bff8ff,#4aa5b2)] text-[#07343c]"
          />
          <LegendItem
            icon={Crown}
            label="Premiere"
            description="Perfil com acesso exclusivo Premiere."
            iconClass="border-[#e8c77d] bg-[#302219] text-[#e8c77d]"
          />
          <LegendItem
            icon={Sparkles}
            label="Perfil novo"
            description="Entrou recentemente na comunidade."
            iconClass="border-luxury-gold/70 bg-luxury-gold/15 text-luxury-champagne"
          />
          <LegendItem
            icon={Pin}
            label="Pin"
            description="Salva o perfil na sua lista de favoritos."
            iconClass="border-luxury-gold/70 bg-luxury-black/70 text-luxury-champagne"
          />
        </div>
      </aside>
    </div>
  );
}
