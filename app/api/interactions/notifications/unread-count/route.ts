import { forwardInteractionRequest } from "../../_proxy";

export function GET() {
  return forwardInteractionRequest("/interactions/notifications/unread-count");
}
