import { forwardChatRequest } from "../../_proxy";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardChatRequest(`/chat/conversations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
