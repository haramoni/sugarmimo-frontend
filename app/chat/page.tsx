import { Suspense } from "react";
import { ChatClient } from "./ChatClient";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[var(--surface)]">
          <p className="text-sm font-bold text-black/55">Abrindo conversas…</p>
        </main>
      }
    >
      <ChatClient />
    </Suspense>
  );
}
