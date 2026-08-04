import { forwardChatRequest } from "../../../_proxy";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cursor = new URL(request.url).searchParams.get("cursor");
  return forwardChatRequest(
    `/chat/conversations/${encodeURIComponent(id)}/messages${
      cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
    }`,
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardChatRequest(
    `/chat/conversations/${encodeURIComponent(id)}/messages`,
    { method: "POST", body },
  );
}
