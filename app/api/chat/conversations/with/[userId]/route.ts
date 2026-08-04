import { forwardChatRequest } from "../../../_proxy";

export async function POST(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  return forwardChatRequest(
    `/chat/conversations/with/${encodeURIComponent(userId)}`,
    { method: "POST" },
  );
}
