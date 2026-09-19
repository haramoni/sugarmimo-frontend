import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '../auth/_cookies';
import { ADMIN_SESSION_COOKIE } from '../admin/_session';
import { CONSENT_COOKIE, CONSENT_VERSION } from '@/lib/cookie-consent';
import { METRIC_ACTION_LABELS, METRIC_PAGE_LABELS, METRIC_SOURCE_LABELS } from '@/lib/metrics';

const VISITOR_COOKIE = 'sugarmimo_metrics_visitor';
const SESSION_COOKIE = 'sugarmimo_metrics_session';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

function sameOrigin(request: NextRequest) {
  return request.headers.get('origin') === request.nextUrl.origin;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const response = new NextResponse(null, { status: 204 });
  for (const name of [VISITOR_COOKIE, SESSION_COOKIE]) response.cookies.set(name, '', { ...options, maxAge: 0 });
  return response;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (request.cookies.get(CONSENT_COOKIE)?.value !== `${CONSENT_VERSION}.accepted` || request.cookies.has(ADMIN_SESSION_COOKIE)) {
    return new NextResponse(null, { status: 204 });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return new NextResponse(null, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return new NextResponse(null, { status: 400 });
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 2048) { await reader.cancel(); return new NextResponse(null, { status: 413 }); }
    chunks.push(value);
  }
  let body: Record<string, unknown>;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>; }
  catch { return new NextResponse(null, { status: 400 }); }
  if (!body || typeof body !== 'object' || typeof body.id !== 'string' || !UUID.test(body.id) ||
    !['PAGE_VIEW', 'CLICK'].includes(String(body.type)) || !Object.hasOwn(METRIC_PAGE_LABELS, String(body.page)) ||
    !Object.hasOwn(METRIC_SOURCE_LABELS, String(body.source)) ||
    (body.type === 'CLICK' ? !Object.hasOwn(METRIC_ACTION_LABELS, String(body.target)) : body.target !== undefined)) {
    return new NextResponse(null, { status: 400 });
  }
  const savedVisitor = request.cookies.get(VISITOR_COOKIE)?.value ?? '';
  const visitorId = UUID.test(savedVisitor) ? savedVisitor : randomUUID();
  const [savedSession = '', savedSource = ''] = (request.cookies.get(SESSION_COOKIE)?.value ?? '').split('.');
  const keepSession = UUID.test(savedSession) && Object.hasOwn(METRIC_SOURCE_LABELS, savedSource);
  const sessionId = keepSession ? savedSession : randomUUID();
  const source = keepSession ? savedSource : String(body.source);
  const upstream = await fetch(`${API_URL}/metrics/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(5000),
    body: JSON.stringify({ id: body.id, type: body.type, page: body.page, target: body.target, source, visitorId, sessionId, consent: `${CONSENT_VERSION}.accepted` }),
  }).catch(() => null);
  if (!upstream?.ok) return new NextResponse(null, { status: upstream?.status === 429 ? 429 : 503 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(VISITOR_COOKIE, visitorId, { ...options, maxAge: 90 * 86400 });
  response.cookies.set(SESSION_COOKIE, `${sessionId}.${source}`, { ...options, maxAge: 1800 });
  return response;
}
