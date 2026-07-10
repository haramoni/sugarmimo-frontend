"use client";

import {
  Inbox,
  Loader2,
  type LucideIcon,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "../components/ui/Navbar";
import { useAuth } from "../components/AuthProvider";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

type ChatPhoto = {
  id: string;
  dataUrl: string;
  sortOrder: number;
};

type ChatUser = {
  id: string;
  username: string;
  role?: string | null;
  city?: string | null;
  state?: string | null;
  photos?: ChatPhoto[];
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  createdAt?: string | null;
};

type ChatConversation = {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  otherUser: ChatUser;
  lastMessage?: ChatMessage | null;
};

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [startedForUserId, setStartedForUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isApprovalPending = shouldShowPendingApproval(user);
  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null,
    [activeConversationId, conversations],
  );

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/chat/conversations").catch(() => null);

    if (!response) {
      setError("Nao foi possivel carregar suas conversas.");
      return;
    }

    const result = await response.json().catch(() => null);

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setError(result?.message ?? "Nao foi possivel carregar suas conversas.");
      return;
    }

    const nextConversations = Array.isArray(result)
      ? (result as ChatConversation[])
      : [];
    setConversations(nextConversations);
    setError("");

    setActiveConversationId((current) => {
      const queryConversationId = searchParams.get("conversationId");

      if (
        queryConversationId &&
        nextConversations.some(
          (conversation) => conversation.id === queryConversationId,
        )
      ) {
        return queryConversationId;
      }

      if (
        current &&
        nextConversations.some((conversation) => conversation.id === current)
      ) {
        return current;
      }

      return nextConversations[0]?.id ?? "";
    });
  }, [router, searchParams]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      const response = await fetch(
        `/api/chat/conversations/${encodeURIComponent(
          conversationId,
        )}/messages`,
      ).catch(() => null);

      if (!response) {
        setError("Nao foi possivel carregar as mensagens.");
        setIsLoadingMessages(false);
        return;
      }

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setError(result?.message ?? "Nao foi possivel carregar as mensagens.");
        setIsLoadingMessages(false);
        return;
      }

      setMessages(Array.isArray(result) ? (result as ChatMessage[]) : []);
      setError("");
      setIsLoadingMessages(false);
    },
    [router],
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  useEffect(() => {
    if (!user || isApprovalPending) {
      return;
    }

    let isMounted = true;

    async function initialLoad() {
      setIsLoadingConversations(true);
      await loadConversations();

      if (isMounted) {
        setIsLoadingConversations(false);
      }
    }

    void initialLoad();
    const intervalId = window.setInterval(() => {
      void loadConversations();
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isApprovalPending, loadConversations, user]);

  useEffect(() => {
    const userId = searchParams.get("userId");

    if (!user || isApprovalPending || !userId || userId === startedForUserId) {
      return;
    }

    const participantId = userId;
    let cancelled = false;

    async function startConversation() {
      setStartedForUserId(participantId);
      setIsLoadingConversations(true);

      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      }).catch(() => null);

      if (!response) {
        setError("Nao foi possivel iniciar a conversa.");
        setIsLoadingConversations(false);
        return;
      }

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setError(result?.message ?? "Nao foi possivel iniciar a conversa.");
        setIsLoadingConversations(false);
        return;
      }

      if (cancelled) {
        return;
      }

      const conversation = result as ChatConversation;
      setConversations((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.id !== conversation.id,
        );
        return [conversation, ...withoutDuplicate];
      });
      setActiveConversationId(conversation.id);
      setIsLoadingConversations(false);
      router.replace(`/chat?conversationId=${conversation.id}`);
    }

    void startConversation();

    return () => {
      cancelled = true;
    };
  }, [isApprovalPending, router, searchParams, startedForUserId, user]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadMessages(activeConversationId);
    }, 0);
    const intervalId = window.setInterval(() => {
      void loadMessages(activeConversationId);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeConversationId || !draft.trim() || isSending) {
      return;
    }

    const messageBody = draft.trim();
    setDraft("");
    setIsSending(true);

    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(
        activeConversationId,
      )}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody }),
      },
    ).catch(() => null);

    if (!response) {
      setError("Nao foi possivel enviar a mensagem.");
      setDraft(messageBody);
      setIsSending(false);
      return;
    }

    const result = await response.json().catch(() => null);

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setError(result?.message ?? "Nao foi possivel enviar a mensagem.");
      setDraft(messageBody);
      setIsSending(false);
      return;
    }

    setMessages((current) => [...current, result as ChatMessage]);
    setIsSending(false);
    void loadConversations();
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--ruby)_10%,transparent),transparent_26%),url('/wallpaper-marble.png')] bg-cover bg-fixed bg-center text-black-jewel">
        <Navbar />

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] lg:px-8">
          <aside className="min-h-[22rem] overflow-hidden rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70">
            <div className="border-b border-emerald/16 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald text-white shadow-[0_12px_28px_rgba(0,108,88,0.22)]">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Chat
                  </h1>
                  <p className="text-sm font-semibold text-black-jewel/64">
                    Conversas privadas
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-2">
              {isLoadingConversations ? (
                <StateNotice
                  icon={Loader2}
                  title="Carregando"
                  description="Buscando suas conversas."
                  spin
                />
              ) : conversations.length === 0 ? (
                <StateNotice
                  icon={Inbox}
                  title="Sem conversas"
                  description="Abra um perfil e toque em Mensagem para comecar."
                />
              ) : (
                conversations.map((conversation) => (
                  <ConversationButton
                    key={conversation.id}
                    conversation={conversation}
                    active={conversation.id === activeConversationId}
                    onClick={() => setActiveConversationId(conversation.id)}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] shadow-[0_22px_58px_rgba(20,17,14,0.12)] ring-1 ring-white/70">
            {activeConversation ? (
              <>
                <ChatHeader user={activeConversation.otherUser} />

                {error ? (
                  <div className="border-b border-ruby/20 bg-ruby/8 px-4 py-3 text-sm font-bold text-ruby">
                    {error}
                  </div>
                ) : null}

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                  {isLoadingMessages && messages.length === 0 ? (
                    <StateNotice
                      icon={Loader2}
                      title="Carregando"
                      description="Abrindo a conversa."
                      spin
                    />
                  ) : messages.length === 0 ? (
                    <StateNotice
                      icon={MessageCircle}
                      title="Primeira mensagem"
                      description="Envie uma mensagem curta para iniciar."
                    />
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMine={message.senderId === user.id}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="flex gap-2 border-t border-emerald/16 bg-white/54 p-3 sm:p-4"
                  onSubmit={handleSubmit}
                >
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Escreva uma mensagem"
                    maxLength={2000}
                    className="h-12 min-w-0 rounded-sm border-emerald/28 bg-white/88"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || isSending}
                    aria-label="Enviar mensagem"
                    className="h-12 w-12 shrink-0 rounded-sm bg-emerald text-white hover:bg-emerald/84"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-6">
                <StateNotice
                  icon={MessageCircle}
                  title="Selecione uma conversa"
                  description="Suas mensagens aparecem aqui."
                />
              </div>
            )}
          </section>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function ConversationButton({
  conversation,
  active,
  onClick,
}: {
  conversation: ChatConversation;
  active: boolean;
  onClick: () => void;
}) {
  const photo = getUserPhoto(conversation.otherUser);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "mb-2 flex min-h-20 w-full min-w-0 items-center gap-3 rounded-sm border px-3 py-2 text-left transition",
        active
          ? "border-emerald bg-[color-mix(in_srgb,var(--emerald)_10%,white)] shadow-[0_10px_22px_rgba(0,55,44,0.12)]"
          : "border-transparent bg-white/58 hover:border-emerald/24 hover:bg-white/84",
      ].join(" ")}
    >
      <Avatar photo={photo} name={conversation.otherUser.username} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-black-jewel">
          {conversation.otherUser.username}
        </span>
        <span className="mt-1 block truncate text-xs font-semibold text-black-jewel/62">
          {conversation.lastMessage?.body ?? "Conversa iniciada"}
        </span>
      </span>
      <span className="shrink-0 text-[0.68rem] font-bold text-black-jewel/46">
        {formatShortDate(conversation.lastMessage?.createdAt)}
      </span>
    </button>
  );
}

function ChatHeader({ user }: { user: ChatUser }) {
  const photo = getUserPhoto(user);
  const location = [user.city, user.state].filter(Boolean).join(", ");

  return (
    <header className="flex min-h-20 items-center gap-3 border-b border-emerald/16 bg-white/54 px-4 py-3 sm:px-5">
      <Avatar photo={photo} name={user.username} />
      <div className="min-w-0">
        <h2 className="truncate text-lg font-extrabold text-black-jewel">
          {user.username}
        </h2>
        <p className="truncate text-sm font-semibold text-black-jewel/62">
          {location || roleLabel(user.role)}
        </p>
      </div>
    </header>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <div className={["flex", isMine ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[min(34rem,82%)] rounded-lg px-3 py-2 shadow-[0_8px_18px_rgba(20,17,14,0.08)]",
          isMine
            ? "bg-emerald text-white"
            : "border border-emerald/18 bg-white/84 text-black-jewel",
        ].join(" ")}
      >
        <p className="wrap-anywhere whitespace-pre-wrap text-sm font-semibold leading-6">
          {message.body}
        </p>
        <span
          className={[
            "mt-1 block text-right text-[0.68rem] font-bold",
            isMine ? "text-white/70" : "text-black-jewel/42",
          ].join(" ")}
        >
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

function StateNotice({
  icon: Icon,
  title,
  description,
  spin = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  spin?: boolean;
}) {
  return (
    <div className="grid min-h-52 place-items-center p-4 text-center">
      <div className="max-w-xs">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald text-white shadow-[0_12px_26px_rgba(0,108,88,0.2)]">
          <Icon className={["h-5 w-5", spin ? "animate-spin" : ""].join(" ")} />
        </span>
        <h3 className="mt-3 text-lg font-extrabold text-black-jewel">
          {title}
        </h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-black-jewel/62">
          {description}
        </p>
      </div>
    </div>
  );
}

function Avatar({ photo, name }: { photo?: ChatPhoto; name: string }) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-emerald/30 bg-white text-emerald">
      {photo ? (
        // User uploads are data URLs and should not use Next image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.dataUrl}
          alt={`Foto de ${name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound className="h-6 w-6" />
      )}
    </span>
  );
}

function getUserPhoto(user: ChatUser) {
  return [...(user.photos ?? [])].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  )[0];
}

function roleLabel(role?: string | null) {
  return role === "SUGAR_DADDY" ? "Sugar Daddy" : "Sugar Baby";
}

function formatShortDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatMessageTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
