"use client";

import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bodyTypes,
  childrenOptions,
  drinkOptions,
  educationOptions,
  ethnicities,
  eyeColors,
  hairColors,
  occupationOptions,
  optionsForProfile,
  relationshipOptions,
  smokeOptions,
} from "../../perfil/perfiloptions";

export type AdvancedProfileFilterValue = {
  bodyType: string;
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  minHeight: string;
  maxHeight: string;
  smoke: string;
  drink: string;
  relationship: string;
  children: string;
  education: string;
  occupation: string;
};

export const EMPTY_ADVANCED_PROFILE_FILTERS: AdvancedProfileFilterValue = {
  bodyType: "",
  ethnicity: "",
  hairColor: "",
  eyeColor: "",
  minHeight: "",
  maxHeight: "",
  smoke: "",
  drink: "",
  relationship: "",
  children: "",
  education: "",
  occupation: "",
};

const HEIGHT_OPTIONS = Array.from({ length: 23 }, (_, index) =>
  String(120 + index * 5),
);

export default function AdvancedProfileFilters({
  value,
  onChange,
  targetProfileType,
}: {
  value: AdvancedProfileFilterValue;
  onChange: (value: AdvancedProfileFilterValue) => void;
  targetProfileType?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = Object.values(value).filter(Boolean).length;

  function update(field: keyof AdvancedProfileFilterValue, nextValue: string) {
    onChange({ ...value, [field]: nextValue === "ALL" ? "" : nextValue });
  }

  return (
    <div className="rounded-lg border border-luxury-gold/30 bg-luxury-black/35">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="advanced-profile-filters"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-extrabold text-luxury-champagne transition hover:bg-luxury-gold/10"
      >
        <SlidersHorizontal className="h-4 w-4 shrink-0" />
        <span className="flex-1">
          {isOpen ? "Ocultar filtros avançados" : "Mostrar filtros avançados"}
        </span>
        {activeCount ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-luxury-gold px-1.5 text-[0.65rem] text-luxury-ink">
            {activeCount}
          </span>
        ) : null}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          id="advanced-profile-filters"
          className="space-y-3 border-t border-luxury-gold/25 px-3 pb-3 pt-3"
        >
          <FilterSelect
            id="body-type-filter"
            label="Tipo físico"
            value={value.bodyType}
            options={optionsForProfile(bodyTypes, targetProfileType)}
            onChange={(nextValue) => update("bodyType", nextValue)}
          />
          <FilterSelect
            id="ethnicity-filter"
            label="Tom de pele"
            value={value.ethnicity}
            options={optionsForProfile(ethnicities, targetProfileType)}
            onChange={(nextValue) => update("ethnicity", nextValue)}
          />
          <FilterSelect
            id="hair-color-filter"
            label="Cor do cabelo"
            value={value.hairColor}
            options={hairColors}
            onChange={(nextValue) => update("hairColor", nextValue)}
          />
          <FilterSelect
            id="eye-color-filter"
            label="Cor dos olhos"
            value={value.eyeColor}
            options={eyeColors}
            onChange={(nextValue) => update("eyeColor", nextValue)}
          />

          <div className="space-y-2">
            <span className="block text-sm font-bold text-luxury-ivory">
              Altura
            </span>
            <div className="grid grid-cols-2 gap-2">
              <FilterSelect
                id="min-height-filter"
                label="Mínima"
                value={value.minHeight}
                options={HEIGHT_OPTIONS}
                optionLabel={(option) => `${option} cm`}
                compact
                onChange={(nextValue) => update("minHeight", nextValue)}
              />
              <FilterSelect
                id="max-height-filter"
                label="Máxima"
                value={value.maxHeight}
                options={HEIGHT_OPTIONS}
                optionLabel={(option) => `${option} cm`}
                compact
                onChange={(nextValue) => update("maxHeight", nextValue)}
              />
            </div>
          </div>

          <FilterSelect
            id="children-filter"
            label="Filhos"
            value={value.children}
            options={childrenOptions}
            onChange={(nextValue) => update("children", nextValue)}
          />
          <FilterSelect
            id="smoke-filter"
            label="Fuma"
            value={value.smoke}
            options={smokeOptions}
            onChange={(nextValue) => update("smoke", nextValue)}
          />
          <FilterSelect
            id="drink-filter"
            label="Bebe"
            value={value.drink}
            options={drinkOptions}
            onChange={(nextValue) => update("drink", nextValue)}
          />
          <FilterSelect
            id="relationship-filter"
            label="Estado civil"
            value={value.relationship}
            options={optionsForProfile(relationshipOptions, targetProfileType)}
            onChange={(nextValue) => update("relationship", nextValue)}
          />
          <FilterSelect
            id="education-filter"
            label="Escolaridade"
            value={value.education}
            options={educationOptions}
            onChange={(nextValue) => update("education", nextValue)}
          />
          <FilterSelect
            id="occupation-filter"
            label="Profissão"
            value={value.occupation}
            options={optionsForProfile(occupationOptions, targetProfileType)}
            onChange={(nextValue) => update("occupation", nextValue)}
          />

          {activeCount ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange({ ...EMPTY_ADVANCED_PROFILE_FILTERS })}
              className="h-9 w-full text-xs font-bold text-luxury-muted hover:bg-luxury-gold/10 hover:text-luxury-champagne"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar filtros avançados
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  optionLabel = (option) => option,
  compact = false,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  optionLabel?: (option: string) => string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={id}
        className={`block font-bold text-luxury-ivory ${compact ? "text-xs" : "text-sm"}`}
      >
        {label}
      </label>
      <Select value={value || "ALL"} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="h-10 w-full min-w-0 rounded-md border-luxury-gold/40 bg-luxury-black/72 px-2.5 text-xs font-semibold text-luxury-ivory focus-visible:border-luxury-champagne focus-visible:ring-luxury-gold/20 [&_svg]:text-luxury-champagne"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="premium-select-content max-h-72 rounded-lg border border-luxury-gold/45 bg-luxury-surface-raised p-1 text-luxury-ivory shadow-[0_22px_48px_rgba(0,0,0,0.48)]"
        >
          <SelectItem value="ALL">Qualquer</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {optionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
