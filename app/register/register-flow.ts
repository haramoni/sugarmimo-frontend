export const REGISTER_CURRENT_STEP_KEY = "sugarmimo:register-current-step";
export const REGISTER_STEP_ONE_KEY = "sugarmimo:register-step-one";
export const REGISTER_PAYLOAD_KEY = "sugarmimo:register-payload";
export const REGISTER_REFERRAL_KEY = "sugarmimo:register-referral";

const VALID_USERNAME = /^[A-Za-z0-9._-]{2,30}$/;

export function setRegisterStep(step: string) {
  window.localStorage.setItem(REGISTER_CURRENT_STEP_KEY, step);
}

export function clearRegisterFlow() {
  window.localStorage.removeItem(REGISTER_CURRENT_STEP_KEY);
  window.localStorage.removeItem(REGISTER_STEP_ONE_KEY);
  window.localStorage.removeItem(REGISTER_PAYLOAD_KEY);
  window.localStorage.removeItem(REGISTER_REFERRAL_KEY);
}

export function captureReferralFromUrl() {
  const referralUsername = new URLSearchParams(window.location.search)
    .get("ref")
    ?.trim()
    .toLowerCase();

  if (referralUsername && VALID_USERNAME.test(referralUsername)) {
    window.localStorage.setItem(REGISTER_REFERRAL_KEY, referralUsername);
  }
}

export function getStoredReferralUsername() {
  return window.localStorage.getItem(REGISTER_REFERRAL_KEY) ?? undefined;
}

export function getSavedRegisterStep() {
  const savedStep = window.localStorage.getItem(REGISTER_CURRENT_STEP_KEY);
  const hasStartedFlow = Boolean(
    window.localStorage.getItem(REGISTER_STEP_ONE_KEY) ||
    window.localStorage.getItem(REGISTER_PAYLOAD_KEY),
  );

  return hasStartedFlow ? savedStep : null;
}
