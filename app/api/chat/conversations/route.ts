import { forwardChatRequest } from "../_proxy";

export function GET() {
  return forwardChatRequest("/chat/conversations");
}
