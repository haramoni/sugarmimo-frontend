import { forwardAdminRequest } from '../_proxy';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ['from', 'to']) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  return forwardAdminRequest(`/admin/metrics?${query.toString()}`);
}
