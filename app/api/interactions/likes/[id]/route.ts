import { forwardInteractionRequest } from "../../_proxy";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardInteractionRequest(
    `/interactions/likes/${encodeURIComponent(id)}`,
    { method: "POST" },
  );
}
