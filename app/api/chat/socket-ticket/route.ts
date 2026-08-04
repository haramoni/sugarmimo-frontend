import { forwardChatRequest } from "../_proxy";

export function POST() {
  return forwardChatRequest("/chat/socket-ticket", { method: "POST" });
}
