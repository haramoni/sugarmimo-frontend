import { forwardChatRequest } from "../../../_proxy";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardChatRequest(
    `/chat/conversations/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
}
