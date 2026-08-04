import { forwardChatRequest } from "../../../_proxy";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardChatRequest(
    `/chat/conversations/${encodeURIComponent(id)}/reports`,
    { method: "POST", body },
  );
}
