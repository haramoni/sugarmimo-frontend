'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { readConsent, subscribeToConsent } from '@/lib/cookie-consent';
import { metricPage, metricSource, METRIC_ACTION_LABELS } from '@/lib/metrics';

export function SiteMetrics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeToConsent, readConsent, () => null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    const page = metricPage(pathname);
    if (consent !== 'accepted' || !page || navigator.webdriver) return;
    const source = metricSource(document.referrer, window.location.origin);
    function send(type: 'PAGE_VIEW' | 'CLICK', target?: string) {
      const body = JSON.stringify({ id: crypto.randomUUID(), type, page, source, ...(target ? { target } : {}) });
      // Serialize requests so the first event sets the browser/session cookies before the next.
      queue.current = queue.current.catch(() => undefined).then(() => {
        if (readConsent() !== 'accepted') return;
        return fetch('/api/metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
          .then(() => { if (readConsent() !== 'accepted') return fetch('/api/metrics', { method: 'DELETE', keepalive: true }); })
          .catch(() => undefined);
      });
    }
    const timer = window.setTimeout(() => send('PAGE_VIEW'), 0);
    function click(event: MouseEvent) {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>('[data-metric-action], a[href]');
      if (!element) return;
      let action = element.dataset.metricAction;
      if (!action && element instanceof HTMLAnchorElement) {
        const url = new URL(element.href, window.location.origin);
        if (url.origin === window.location.origin) {
          const destination = metricPage(url.pathname);
          if (destination && ['register', 'login', 'plans', 'checkout'].includes(destination)) action = destination;
        }
      }
      if (action === 'whatsapp_support' && event.defaultPrevented) return;
      if (action && Object.hasOwn(METRIC_ACTION_LABELS, action)) send('CLICK', action);
    }
    document.addEventListener('click', click);
    return () => { window.clearTimeout(timer); document.removeEventListener('click', click); };
  }, [pathname, consent]);

  return null;
}
