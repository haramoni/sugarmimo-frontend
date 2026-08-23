"use client";

import { Clock3, Loader2, Rocket, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";

export type BoostStatus = {
  boostCredits: number;
  boostedUntil: string | null;
};

export function BoostControl({
  credits,
  boostedUntil,
  onActivated,
}: {
  credits: number;
  boostedUntil: string | null;
  onActivated: (status: BoostStatus) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [isActivating, setIsActivating] = useState(false);
  const expiration = boostedUntil ? new Date(boostedUntil).getTime() : 0;
  const remainingMs = Math.max(0, expiration - now);
  const isActive = remainingMs > 0;

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, [isActive]);

  async function activate() {
    const confirmation = await Swal.fire({
      icon: "question",
      title: "Ativar Boost agora?",
      text: "Um Boost será consumido e seu perfil ficará em destaque por 24 horas.",
      showCancelButton: true,
      confirmButtonText: "Ativar por 24h",
      cancelButtonText: "Agora não",
      confirmButtonColor: "#006c58",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsActivating(true);

    try {
      const response = await fetch("/api/boosts/activate", { method: "POST" });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível ativar o Boost.");
      }

      const status = result as BoostStatus;
      onActivated(status);
      setNow(Date.now());
      await Swal.fire({
        icon: "success",
        title: "Boost ativado!",
        text: "Seu perfil já está em destaque na tela inicial pelas próximas 24 horas.",
        confirmButtonColor: "#006c58",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Não foi possível ativar",
        text:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
        confirmButtonColor: "#006c58",
      });
    } finally {
      setIsActivating(false);
    }
  }

  if (isActive) {
    return (
      <div className="rounded-xl border border-gold/55 bg-[linear-gradient(145deg,rgba(185,138,56,0.24),rgba(255,255,255,0.08))] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.16)]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-white shadow-lg">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-gold-soft">Boost ativo</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-white/78">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRemainingTime(remainingMs)} restantes
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-white/72">
          Seu perfil está aparecendo nos destaques da tela inicial.
        </p>
        <p className="mt-2 text-xs font-bold text-white/85">
          {credits} {credits === 1 ? "Boost disponível" : "Boosts disponíveis"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-gold-soft">
            {credits > 0
              ? `${credits} ${credits === 1 ? "Boost disponível" : "Boosts disponíveis"}`
              : "Nenhum Boost disponível"}
          </p>
          <p className="mt-1 text-xs leading-5 text-white/72">
            {credits > 0
              ? "Ative quando quiser para ficar 24 horas nos destaques."
              : "A compra de Boosts será disponibilizada em breve."}
          </p>
        </div>
        <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-gold-soft" />
      </div>
      <Button
        type="button"
        disabled={credits < 1 || isActivating}
        onClick={() => void activate()}
        className="mt-3 h-auto min-h-11 w-full rounded-full border border-white/20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--emerald)_78%,white),var(--emerald))] px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,108,88,0.34)] hover:bg-emerald/85 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isActivating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        {isActivating ? "ATIVANDO..." : "ATIVAR BOOST"}
      </Button>
    </div>
  );
}

function formatRemainingTime(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}
