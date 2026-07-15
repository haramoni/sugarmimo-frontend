import { forwardInteractionRequest } from "../_proxy";

export async function GET() {
  return forwardInteractionRequest("/interactions/notifications");
}
