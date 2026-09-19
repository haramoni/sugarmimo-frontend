"use client";

import { Activity, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
    <>
      {result?.items.length ? (
        <section
          aria-labelledby="boost-title"
          aria-roledescription="carrossel"
          className="mb-8 border-b border-luxury-gold/30 pb-7"
        >
          <div className="mb-4">
            <div className="relative min-w-full">
              <header className="relative overflow-hidden rounded-xl border border-luxury-gold/65 bg-[linear-gradient(135deg,var(--luxury-surface-raised)_0%,var(--luxury-night)_58%,var(--luxury-surface)_100%)] px-4 py-3.5 pr-14 shadow-[0_0_20px_rgba(213,166,78,0.11),0_16px_40px_rgba(0,0,0,0.28)] sm:px-5 sm:py-4 sm:pr-20">
                <div
                  aria-hidden="true"
                  className="absolute -right-8 top-0 h-full w-44 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--luxury-gold)_18%,transparent),transparent_62%)] opacity-50"
                />

                <div className="relative flex items-center gap-3 sm:gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-luxury-champagne/80 bg-[linear-gradient(145deg,var(--luxury-gold),var(--luxury-gold-deep))] text-luxury-ivory shadow-[0_0_18px_rgba(213,166,78,0.32)] sm:h-11 sm:w-11">
                    <Activity className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h1
                      id="boost-title"
                      className="mt-0.5 font-serif text-2xl font-semibold leading-tight text-luxury-champagne sm:text-3xl"
                    >
                      Perfis com Boost ativo
                    </h1>
                    <div className="mt-1 max-w-4xl text-xs font-medium leading-5 text-luxury-muted sm:text-sm">
                      <p>
                        Descubra os perfis em destaque com Boost na comunidade
                        SugarMimo e conheça novas conexões.
                      </p>
                    </div>
                  </div>
                </div>
              </header>
              <ProfileSymbolsMenu />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                aria-label="Boosts anteriores"
                aria-controls="boost-rail"
                disabled={loading || page === 1}
                onClick={() => navigate(page - 1)}
                className="rounded-full border border-luxury-gold/60 p-1.5 text-luxury-champagne transition hover:bg-luxury-gold/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Próximos Boosts"
                aria-controls="boost-rail"
                disabled={loading || !!error || !result?.hasMore}
                onClick={() => navigate(page + 1)}
                className="rounded-full border border-luxury-gold/60 p-1.5 text-luxury-champagne transition hover:bg-luxury-gold/10 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <p className="flex min-h-24 items-center gap-2 text-luxury-muted">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando
                Boosts...
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
                className="grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-4 overflow-x-auto pb-3 sm:auto-cols-[calc((100%_-_1rem)/2)] lg:auto-cols-[calc((100%_-_3rem)/4)]"
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
      ) : null}
    </>
  );
}
