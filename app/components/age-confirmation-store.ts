export const AGE_CONFIRMATION_KEY = "sugarmimo_age_confirmation";
export const AGE_CONFIRMATION_VERSION = "v1.18-plus";
export const AGE_CONFIRMATION_EVENT = "sugarmimo-age-confirmation";

let volatileAgeConfirmed = false;

export function subscribeToAgeConfirmation(callback: () => void) {
  window.addEventListener(AGE_CONFIRMATION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AGE_CONFIRMATION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function hasAgeConfirmation() {
  try {
    return volatileAgeConfirmed || (
      window.localStorage.getItem(AGE_CONFIRMATION_KEY) ===
      AGE_CONFIRMATION_VERSION
    );
  } catch {
    return volatileAgeConfirmed;
  }
}

export function saveAgeConfirmation() {
  volatileAgeConfirmed = true;

  try {
    window.localStorage.setItem(AGE_CONFIRMATION_KEY, AGE_CONFIRMATION_VERSION);
  } catch {
    // Some private mobile browsers block storage. Keep confirmation in memory.
  }

  window.dispatchEvent(new Event(AGE_CONFIRMATION_EVENT));
}
