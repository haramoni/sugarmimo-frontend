import { Suspense } from "react";
import { ChatClient } from "./ChatClient";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-luxury-black">
          <p className="text-sm font-bold text-luxury-muted">
            Abrindo conversas…
          </p>
        </main>
      }
    >
      <ChatClient />
    </Suspense>
  );
}
