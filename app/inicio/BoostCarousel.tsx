"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProfileCard from "../buscar/components/ProfileCard";
import type { PublicProfilePage } from "../buscar/types";
import { ProfileSymbolsMenu } from "./components/ProfileSymbolsMenu";

export default function BoostCarousel({ viewerId }: { viewerId: string }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PublicProfilePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/boosts?page=${page}&limit=5`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error("Não foi possível carregar os Boosts.");
        return data as PublicProfilePage;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult(data);
        rail.current?.scrollTo({ left: 0, behavior: "instant" });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Não foi possível carregar os Boosts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, viewerId, attempt]);

  function navigate(next: number) {
    setLoading(true);
    setError("");
    setPage(next);
  }

  return (
    <section
      aria-labelledby="boost-title"
      aria-roledescription="carrossel"
      className="mb-9 border-b border-luxury-gold/30 pb-8"
    >
      <div className="mb-5 flex items-center justify-between gap-4 flex-col">
        <div className="relative mb-7 min-w-full">
          <header className="relative overflow-hidden rounded-xl border border-luxury-gold/65 bg-[linear-gradient(135deg,var(--luxury-surface-raised)_0%,var(--luxury-night)_58%,var(--luxury-surface)_100%)] p-5 pr-16 shadow-[0_0_24px_rgba(213,166,78,0.13),0_24px_64px_rgba(0,0,0,0.34)] sm:p-7 sm:pr-20">
            <div
              aria-hidden="true"
              className="absolute -right-8 top-0 h-full w-52 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--luxury-gold)_18%,transparent),transparent_62%)] opacity-60"
            />

            <div className="relative flex items-start gap-4 sm:gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-luxury-champagne/80 bg-[linear-gradient(145deg,var(--luxury-gold),var(--luxury-gold-deep))] text-luxury-ivory shadow-[0_0_24px_rgba(213,166,78,0.38)] sm:h-14 sm:w-14">
                <Activity className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-luxury-gold">
                  Comunidade VIP
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-luxury-champagne sm:text-4xl">
                  Perfis com Boost ativo
                </h1>
                <div className="mt-2 max-w-3xl text-sm font-medium leading-6 text-luxury-muted">
                  <p>
                    Descubra os perfis em destaque com Boost na comunidade
                    SugarMimo. São pessoas que aumentaram sua visibilidade para
                    conhecer novas conexões e encontrar alguém especial.
                  </p>
                </div>
              </div>
            </div>
          </header>
          <ProfileSymbolsMenu />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Boosts anteriores"
            aria-controls="boost-rail"
            disabled={loading || page === 1}
            onClick={() => navigate(page - 1)}
            className="rounded-full border border-luxury-gold/60 p-2 text-luxury-champagne disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Próximos Boosts"
            aria-controls="boost-rail"
            disabled={loading || !!error || !result?.hasMore}
            onClick={() => navigate(page + 1)}
            className="rounded-full border border-luxury-gold/60 p-2 text-luxury-champagne disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <div aria-live="polite" aria-busy={loading}>
        {loading ? (
          <p className="flex min-h-24 items-center gap-2 text-luxury-muted">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando Boosts...
          </p>
        ) : error ? (
          <div className="py-5">
            <p>{error}</p>
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => {
                setLoading(true);
                setError("");
                setAttempt((value) => value + 1);
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : result?.items.length ? (
          <div
            id="boost-rail"
            ref={rail}
            tabIndex={0}
            aria-label={`Boosts, página ${page}. Deslize para ver os perfis.`}
            className="grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col gap-4 overflow-x-auto pb-3 sm:auto-cols-[calc((100%_-_1rem)/2)] md:auto-cols-[calc((100%_-_2rem)/3)] lg:auto-cols-[calc((100%_-_4rem)/5)]"
          >
            {result.items.map((profile) => (
              <div key={profile.id} className="min-w-full snap-start">
                <ProfileCard profile={profile} eager />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-5 text-sm text-luxury-muted">
            Nenhum perfil com Boost ativo no momento.
          </p>
        )}
      </div>
    </section>
  );
}
