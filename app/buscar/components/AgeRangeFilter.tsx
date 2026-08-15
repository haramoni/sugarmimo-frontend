import styles from "./AgeRangeFilter.module.css";

const MIN_AGE = 18;
const MAX_AGE = 80;

export default function AgeRangeFilter({
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange,
}: {
  minAge: string;
  maxAge: string;
  onMinAgeChange: (value: string) => void;
  onMaxAgeChange: (value: string) => void;
}) {
  const minValue = normalizeAge(minAge, MIN_AGE);
  const maxValue = normalizeAge(maxAge, MAX_AGE);
  const left = ((minValue - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;
  const right = 100 - ((maxValue - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.values} aria-live="polite">
        <span>{minValue} anos</span>
        <span>{maxValue === MAX_AGE ? "80+ anos" : `${maxValue} anos`}</span>
      </div>

      <div className={styles.slider}>
        <div className={styles.track} />
        <div
          className={styles.selectedRange}
          style={{ left: `${left}%`, right: `${right}%` }}
        />

        <input
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={minValue}
          onChange={(event) =>
            onMinAgeChange(
              String(Math.min(Number(event.target.value), maxValue)),
            )
          }
          aria-label="Idade mínima"
          className={`${styles.rangeInput} ${minValue > MAX_AGE - 8 ? styles.topThumb : ""}`}
        />
        <input
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          value={maxValue}
          onChange={(event) =>
            onMaxAgeChange(
              String(Math.max(Number(event.target.value), minValue)),
            )
          }
          aria-label="Idade máxima"
          className={styles.rangeInput}
        />
      </div>
    </div>
  );
}

function normalizeAge(value: string, fallback: number) {
  const age = Number(value);

  if (!Number.isFinite(age)) {
    return fallback;
  }

  return Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(age)));
}
