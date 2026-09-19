export const CONSENT_COOKIE = 'sugarmimo_cookie_consent';
// v1 was accepted before analytics existed; it must not authorize new collection.
export const CONSENT_VERSION = 'v2';
export const CONSENT_EVENT = 'sugarmimo-cookie-consent';

export function readConsent() {
  const raw = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`))?.split('=').slice(1).join('=');
  try {
    const value = decodeURIComponent(raw ?? '');
    return value === `${CONSENT_VERSION}.accepted` ? 'accepted' : value === `${CONSENT_VERSION}.rejected` ? 'rejected' : null;
  } catch { return null; }
}

export function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}
