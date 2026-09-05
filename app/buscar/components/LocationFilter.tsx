"use client";

import { Globe2, Loader2, LocateFixed, MapPinned } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import styles from "./LocationFilter.module.css";

export type SearchCoordinates = {
  latitude: number;
  longitude: number;
};

export type LocationMode = "ALL" | "NEARBY" | "OTHER";

export type LocationFilterValue = {
  mode: LocationMode;
  radiusKm: number;
  country: string;
  stateCode: string;
  state: string;
  cityId: string;
  city: string;
  targetCoordinates: SearchCoordinates | null;
};

type LocationStatus = "checking" | "enabled" | "denied" | "unsupported";

type StateOption = {
  code: number;
  abbreviation: string;
  name: string;
  latitude: number;
  longitude: number;
};

type CityOption = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type LocationFilterProps = {
  value: LocationFilterValue;
  onChange: (value: LocationFilterValue) => void;
  locationStatus: LocationStatus;
  onRetryLocation: () => void;
};

const fieldClassName =
  "h-11 w-full rounded-md border border-luxury-gold/40 bg-luxury-black/72 px-3 text-sm font-semibold text-luxury-ivory outline-none transition focus:border-luxury-champagne focus:ring-2 focus:ring-luxury-gold/20 disabled:cursor-not-allowed disabled:opacity-55";

export default function LocationFilter({
  value,
  onChange,
  locationStatus,
  onRetryLocation,
}: LocationFilterProps) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadedCitiesState, setLoadedCitiesState] = useState("");
  const [locationOptionsError, setLocationOptionsError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const isLoadingStatesRef = useRef(false);
  const loadingCitiesStateRef = useRef("");
  const isLoadingStates =
    value.mode === "OTHER" &&
    states.length === 0 &&
    !locationOptionsError;
  const isLoadingCities = Boolean(
    value.mode === "OTHER" &&
      value.stateCode &&
      value.stateCode !== loadedCitiesState &&
      !locationOptionsError,
  );

  useEffect(() => {
    if (
      value.mode !== "OTHER" ||
      states.length > 0 ||
      isLoadingStatesRef.current
    ) {
      return;
    }

    const controller = new AbortController();
    isLoadingStatesRef.current = true;

    fetch("/api/locations", { signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as {
          states?: StateOption[];
          message?: string;
        };
        if (!response.ok) throw new Error(result.message);
        setStates(Array.isArray(result.states) ? result.states : []);
        setLocationOptionsError("");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLocationOptionsError(
            error instanceof Error && error.message
              ? error.message
              : "Não foi possível carregar os estados.",
          );
        }
      })
      .finally(() => {
        isLoadingStatesRef.current = false;
      });

    return () => controller.abort();
  }, [retryKey, states.length, value.mode]);

  useEffect(() => {
    if (value.mode !== "OTHER" || !value.stateCode) {
      return;
    }

    if (
      loadedCitiesState === value.stateCode ||
      loadingCitiesStateRef.current === value.stateCode
    ) {
      return;
    }

    const controller = new AbortController();
    loadingCitiesStateRef.current = value.stateCode;

    fetch(`/api/locations?state=${encodeURIComponent(value.stateCode)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          cities?: CityOption[];
          message?: string;
        };
        if (!response.ok) throw new Error(result.message);
        setCities(Array.isArray(result.cities) ? result.cities : []);
        setLoadedCitiesState(value.stateCode);
        setLocationOptionsError("");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLocationOptionsError(
            error instanceof Error && error.message
              ? error.message
              : "Não foi possível carregar as cidades.",
          );
        }
      })
      .finally(() => {
        if (loadingCitiesStateRef.current === value.stateCode) {
          loadingCitiesStateRef.current = "";
        }
      });

    return () => controller.abort();
  }, [loadedCitiesState, retryKey, value.mode, value.stateCode]);

  const rangeProgress = `${((value.radiusKm - 25) / (500 - 25)) * 100}%`;

  return (
    <fieldset className="space-y-3 border-t border-luxury-gold/20 pt-4">
      <legend className="mb-3 text-sm font-bold text-luxury-ivory">
        Localização
      </legend>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-luxury-muted has-[:checked]:text-luxury-ivory">
        <input
          type="radio"
          name="location-mode"
          value="ALL"
          checked={value.mode === "ALL"}
          onChange={() => onChange({ ...value, mode: "ALL" })}
          className="h-4 w-4 accent-[var(--luxury-gold)]"
        />
        <Globe2 className="h-4 w-4 text-luxury-gold" />
        Todas as localidades
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-luxury-muted has-[:checked]:text-luxury-ivory">
        <input
          type="radio"
          name="location-mode"
          value="NEARBY"
          checked={value.mode === "NEARBY"}
          onChange={() => onChange({ ...value, mode: "NEARBY" })}
          className="h-4 w-4 accent-[var(--luxury-gold)]"
        />
        <LocateFixed className="h-4 w-4 text-luxury-gold" />
        Perfis próximos a você
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-luxury-muted has-[:checked]:text-luxury-ivory">
        <input
          type="radio"
          name="location-mode"
          value="OTHER"
          checked={value.mode === "OTHER"}
          onChange={() => {
            setLocationOptionsError("");
            onChange({ ...value, mode: "OTHER" });
          }}
          className="h-4 w-4 accent-[var(--luxury-gold)]"
        />
        <MapPinned className="h-4 w-4 text-luxury-gold" />
        Outra localidade
      </label>

      {value.mode === "OTHER" ? (
        <div className="space-y-2 pl-6">
          <label className="sr-only" htmlFor="location-country">
            País
          </label>
          <select
            id="location-country"
            value="BR"
            disabled
            className={fieldClassName}
          >
            <option value="BR">Brasil</option>
          </select>

          <label className="sr-only" htmlFor="location-state">
            Estado
          </label>
          <select
            id="location-state"
            value={value.stateCode}
            disabled={isLoadingStates}
            onChange={(event) => {
              setLocationOptionsError("");
              const state = states.find(
                ({ abbreviation }) => abbreviation === event.target.value,
              );
              onChange({
                ...value,
                stateCode: state?.abbreviation ?? "",
                state: state?.abbreviation ?? "",
                cityId: "",
                city: "",
                targetCoordinates: state
                  ? {
                      latitude: state.latitude,
                      longitude: state.longitude,
                    }
                  : null,
              });
            }}
            className={fieldClassName}
          >
            <option value="">
              {isLoadingStates ? "Carregando estados..." : "Escolha o estado"}
            </option>
            {states.map((state) => (
              <option key={state.code} value={state.abbreviation}>
                {state.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="location-city">
            Cidade
          </label>
          <select
            id="location-city"
            value={value.cityId}
            disabled={!value.stateCode || isLoadingCities}
            onChange={(event) => {
              const city = cities.find(
                ({ id }) => String(id) === event.target.value,
              );
              onChange({
                ...value,
                cityId: city ? String(city.id) : "",
                city: city?.name ?? "",
                targetCoordinates: city
                  ? {
                      latitude: city.latitude,
                      longitude: city.longitude,
                    }
                  : value.targetCoordinates,
              });
            }}
            className={fieldClassName}
          >
            <option value="">
              {isLoadingCities
                ? "Carregando cidades..."
                : value.stateCode
                  ? "Todas as cidades"
                  : "Escolha primeiro o estado"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {locationOptionsError ? (
            <div className="text-xs font-semibold text-[#ff9eae]">
              <p>{locationOptionsError}</p>
              <button
                type="button"
                onClick={() => {
                  setLocationOptionsError("");
                  setRetryKey((current) => current + 1);
                }}
                className="font-extrabold text-luxury-champagne underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          ) : !value.stateCode ? (
            <p className="text-xs font-semibold text-luxury-muted">
              Selecione ao menos o estado para aplicar o filtro.
            </p>
          ) : !value.cityId ? (
            <p className="text-xs font-semibold text-luxury-muted">
              Todos os perfis de {value.stateCode} serão incluídos.
            </p>
          ) : null}
        </div>
      ) : null}

      {value.mode === "NEARBY" ||
      (value.mode === "OTHER" && value.cityId) ? (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-luxury-ivory">Distância</span>
            <output className="font-extrabold text-luxury-champagne">
              Até {value.radiusKm} km
            </output>
          </div>
          <input
            type="range"
            min="25"
            max="500"
            step="25"
            value={value.radiusKm}
            onChange={(event) =>
              onChange({ ...value, radiusKm: Number(event.target.value) })
            }
            aria-label="Distância máxima em quilômetros"
            className={styles.range}
            style={{ "--range-progress": rangeProgress } as CSSProperties}
          />
        </div>
      ) : null}

      {value.mode === "NEARBY" ? (
        <div className="flex items-start gap-2 rounded-md border border-luxury-gold/25 bg-luxury-black/45 p-2.5 text-xs font-semibold leading-5 text-luxury-muted">
          {locationStatus === "checking" ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-luxury-gold" />
          ) : (
            <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-luxury-gold" />
          )}
          <div>
            <p>
              {locationStatus === "enabled"
                ? "Sua posição aproximada está ativa para esta busca."
                : locationStatus === "checking"
                  ? "Obtendo sua posição aproximada..."
                  : locationStatus === "denied"
                    ? "Sem permissão. Usaremos a cidade informada no seu perfil."
                    : "Geolocalização indisponível. Usaremos a cidade do seu perfil."}
            </p>
            {locationStatus === "denied" ? (
              <button
                type="button"
                onClick={onRetryLocation}
                className="font-extrabold text-luxury-champagne underline underline-offset-2"
              >
                Tentar novamente
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
