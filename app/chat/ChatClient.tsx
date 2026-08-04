"use client";

import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  ChevronUp,
  Flag,
  LockKeyhole,
  MessageCircle,
  MoreVertical,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "@/app/components/AuthProvider";
import { Navbar } from "@/app/components/ui/Navbar";
import type { ChatMessage, Conversation } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";

const reportCategories = [
  ["HARASSMENT", "Assédio"],
  ["THREAT", "Ameaça"],
  ["FRAUD", "Fraude"],
  ["INAPPROPRIATE_SEXUAL_CONTENT", "Conteúdo sexual impróprio"],
  ["EXTORTION", "Extorsão"],
  ["SPAM", "Spam"],
  ["FAKE_PROFILE", "Perfil falso"],
  ["OTHER", "Outro"],
] as const;

export function ChatClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const openWithUserId = searchParams.get("with");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const selected = conversations.find(({ id }) => id === selectedId) ?? null;
  const filteredConversations = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return term
      ? conversations.filter(({ otherMember }) =>
          otherMember.username.toLocaleLowerCase("pt-BR").includes(term),
        )
      : conversations;
  }, [conversations, search]);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/chat/conversations", {
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(result?.message ?? "Não foi possível carregar as conversas.");
      setLoadingConversations(false);
      return;
    }
    const result = (await response.json()) as Conversation[];
    setConversations(result);
    setSelectedId((current) => current ?? result[0]?.id ?? null);
    setLoadingConversations(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadConversations(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    if (!openWithUserId) {
      return;
    }
    void (async () => {
      const response = await fetch(
        `/api/chat/conversations/with/${encodeURIComponent(openWithUserId)}`,
        { method: "POST" },
      ).catch(() => null);
      if (!response?.ok) {
        return;
      }
      const result = (await response.json()) as { id: string };
      await loadConversations();
      setSelectedId(result.id);
    })();
  }, [loadConversations, openWithUserId]);

  const loadMessages = useCallback(
    async (conversationId: string, cursor?: string, prepend = false) => {
      setLoadingMessages(true);
      const response = await fetch(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages${
          cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
        }`,
        { cache: "no-store" },
      ).catch(() => null);
      if (!response?.ok) {
        const result = await response?.json().catch(() => null);
        setError(result?.message ?? "Não foi possível carregar as mensagens.");
        setLoadingMessages(false);
        return;
      }
      const result = (await response.json()) as {
        items: ChatMessage[];
        nextCursor: string | null;
      };
      setMessages((current) =>
        prepend ? deduplicateMessages([...result.items, ...current]) : result.items,
      );
      setNextCursor(result.nextCursor);
      setLoadingMessages(false);
      if (!prepend) {
        window.setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          20,
        );
      }
    },
    [],
  );

  const markRead = useCallback(async (conversationId: string) => {
    await fetch(
      `/api/chat/conversations/${encodeURIComponent(conversationId)}/read`,
      { method: "PATCH" },
    ).catch(() => null);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );
    window.dispatchEvent(new Event("sugarmimo-chat-updated"));
  }, []);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    const timeoutId = window.setTimeout(() => {
      if (!selectedId) {
        setMessages([]);
        return;
      }
      setMenuOpen(false);
      void loadMessages(selectedId);
      void markRead(selectedId);
      socketRef.current?.emit("conversation:join", {
        conversationId: selectedId,
      });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadMessages, markRead, selectedId]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    let active = true;
    void (async () => {
      const response = await fetch("/api/chat/socket-ticket", {
        method: "POST",
      }).catch(() => null);
      if (!response?.ok || !active) {
        return;
      }
      const { token } = (await response.json()) as { token: string };
      const socket = io(`${API_URL}/chat`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        if (selectedIdRef.current) {
          socket.emit("conversation:join", {
            conversationId: selectedIdRef.current,
          });
        }
      });
      socket.on("message:new", (message: ChatMessage) => {
        if (message.conversationId === selectedIdRef.current) {
          setMessages((current) => deduplicateMessages([...current, message]));
          window.setTimeout(
            () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
            20,
          );
          if (message.senderId !== user.id) {
            void markRead(message.conversationId);
          }
        }
        void loadConversations();
        window.dispatchEvent(new Event("sugarmimo-chat-updated"));
      });
      socket.on(
        "messages:read",
        (event: { conversationId: string; readAt: string }) => {
          setMessages((current) =>
            current.map((message) =>
              message.conversationId === event.conversationId &&
              message.senderId === user.id
                ? { ...message, readAt: event.readAt }
                : message,
            ),
          );
        },
      );
      socket.on(
        "conversation:blocked",
        (event: { conversationId: string }) => {
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === event.conversationId
                ? { ...conversation, blocked: true }
                : conversation,
            ),
          );
        },
      );
    })();
    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [loadConversations, markRead, user?.id]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    if (!selectedId || !draft.trim() || sending || selected?.blocked) {
      return;
    }
    const body = draft.trim();
    setDraft("");
    setSending(true);
    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(selectedId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      },
    ).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setDraft(body);
      setError(result?.message ?? "Não foi possível enviar a mensagem.");
    } else {
      const message = (await response.json()) as ChatMessage;
      setMessages((current) => deduplicateMessages([...current, message]));
      await loadConversations();
      window.setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        20,
      );
    }
    setSending(false);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  async function blockConversation() {
    if (!selectedId) {
      return;
    }
    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(selectedId)}/block`,
      { method: "POST" },
    ).catch(() => null);
    if (response?.ok) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedId
            ? { ...conversation, blocked: true }
            : conversation,
        ),
      );
      setBlockOpen(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,var(--surface),#f6f1e8)] text-[var(--black)]">
      <Navbar />
      <section className="mx-auto h-[calc(100vh-92px)] max-w-7xl px-3 py-4 sm:px-6">
        <div className="grid h-full overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-[0_28px_90px_rgba(20,17,14,0.12)] backdrop-blur-xl md:grid-cols-[340px_1fr]">
          <aside
            className={[
              "min-h-0 border-r border-black/8 bg-[#fcfaf5]",
              selectedId ? "hidden md:flex" : "flex",
              "flex-col",
            ].join(" ")}
          >
            <div className="border-b border-black/8 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                    Matches
                  </p>
                  <h1 className="mt-1 font-serif text-2xl font-semibold">
                    Conversas
                  </h1>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--emerald)] text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
              </div>
              <label className="mt-4 flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 focus-within:border-[var(--gold)]">
                <Search className="h-4 w-4 text-black/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar conversa"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loadingConversations ? (
                <StateMessage>Carregando suas conversas…</StateMessage>
              ) : filteredConversations.length === 0 ? (
                <StateMessage>
                  Seus matches aparecerão aqui quando o like for recíproco.
                </StateMessage>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition",
                      conversation.id === selectedId
                        ? "bg-[color:color-mix(in_srgb,var(--gold-soft)_38%,white)]"
                        : "hover:bg-black/[0.035]",
                    ].join(" ")}
                  >
                    <Avatar conversation={conversation} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">
                          {conversation.otherMember.username}
                        </span>
                        <span className="shrink-0 text-[0.68rem] text-black/45">
                          {formatConversationTime(
                            conversation.lastMessage?.createdAt ??
                              conversation.updatedAt,
                          )}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-black/52">
                          {conversation.blocked
                            ? "Conversa bloqueada"
                            : conversation.lastMessage?.body ??
                              "Comece a conversa"}
                        </span>
                        {conversation.unreadCount > 0 ? (
                          <span className="grid min-w-5 place-items-center rounded-full bg-[var(--ruby)] px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                            {Math.min(conversation.unreadCount, 99)}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section
            className={[
              "min-h-0 flex-col bg-[linear-gradient(180deg,#fff,#fbf8f1)]",
              selectedId ? "flex" : "hidden md:flex",
            ].join(" ")}
          >
            {!selected ? (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)]">
                    <LockKeyhole className="h-7 w-7" />
                  </span>
                  <h2 className="mt-4 font-serif text-2xl font-semibold">
                    Conversas privadas
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">
                    Selecione um match. As mensagens são protegidas e removidas
                    automaticamente após 60 dias.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="flex min-h-20 items-center gap-3 border-b border-black/8 bg-white/80 px-4 backdrop-blur md:px-6">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Voltar às conversas"
                    className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar conversation={selected} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/perfil/${selected.otherMember.id}`}
                      className="block truncate font-bold hover:text-[var(--gold)]"
                    >
                      {selected.otherMember.username}
                    </Link>
                    <p className="mt-0.5 text-xs text-black/48">
                      {isOnline(selected.otherMember.lastActiveAt)
                        ? "Online agora"
                        : "Conversa privada"}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((current) => !current)}
                      aria-label="Opções da conversa"
                      className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {menuOpen ? (
                      <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setReportOpen(true);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-black/5"
                        >
                          <Flag className="h-4 w-4" /> Denunciar conversa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBlockOpen(true);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--ruby)] hover:bg-[var(--ruby)]/5"
                        >
                          <Ban className="h-4 w-4" /> Bloquear perfil
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>

                <div className="flex items-center justify-center gap-2 border-b border-black/5 bg-[var(--emerald)]/[0.035] px-4 py-2 text-center text-[0.7rem] font-medium text-black/52">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--emerald)]" />
                  Protegida no envio e armazenamento · histórico de até 60 dias
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
                  {nextCursor ? (
                    <button
                      type="button"
                      disabled={loadingMessages}
                      onClick={() =>
                        void loadMessages(selected.id, nextCursor, true)
                      }
                      className="mx-auto mb-5 flex items-center gap-1 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold hover:border-[var(--gold)]"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      Mensagens anteriores
                    </button>
                  ) : null}
                  {loadingMessages && messages.length === 0 ? (
                    <StateMessage>Carregando mensagens…</StateMessage>
                  ) : messages.length === 0 ? (
                    <div className="mx-auto mt-10 max-w-sm text-center">
                      <p className="font-serif text-xl font-semibold">
                        Vocês deram match
                      </p>
                      <p className="mt-2 text-sm leading-6 text-black/50">
                        Este pode ser o começo de uma ótima conversa. Envie uma
                        mensagem gentil e autêntica.
                      </p>
                    </div>
                  ) : (
                    <MessageList messages={messages} currentUserId={user?.id} />
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={sendMessage}
                  className="border-t border-black/8 bg-white/90 p-3 sm:p-4"
                >
                  {error ? (
                    <div className="mb-2 flex items-start justify-between rounded-xl bg-[var(--ruby)]/8 px-3 py-2 text-xs font-semibold text-[var(--ruby)]">
                      {error}
                      <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Fechar aviso"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                  {selected.blocked ? (
                    <div className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-semibold text-black/50">
                      Esta conversa está bloqueada.
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-[#fcfaf6] p-2 focus-within:border-[var(--gold)]">
                      <textarea
                        value={draft}
                        onChange={(event) =>
                          setDraft(event.target.value.slice(0, 2000))
                        }
                        onKeyDown={handleComposerKeyDown}
                        rows={1}
                        placeholder="Escreva uma mensagem…"
                        aria-label="Mensagem"
                        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 outline-none"
                      />
                      <span className="pb-3 text-[0.65rem] text-black/35">
                        {draft.length}/2000
                      </span>
                      <button
                        type="submit"
                        disabled={!draft.trim() || sending}
                        aria-label="Enviar mensagem"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--emerald)] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}
          </section>
        </div>
      </section>

      {reportOpen && selected ? (
        <ReportDialog
          conversation={selected}
          messages={messages}
          onClose={() => setReportOpen(false)}
          onReported={(blocked) => {
            setReportOpen(false);
            if (blocked) {
              setConversations((current) =>
                current.map((conversation) =>
                  conversation.id === selected.id
                    ? { ...conversation, blocked: true }
                    : conversation,
                ),
              );
            }
          }}
        />
      ) : null}

      {blockOpen && selected ? (
        <ModalShell onClose={() => setBlockOpen(false)}>
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--ruby)]/10 text-[var(--ruby)]">
              <Ban className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-2xl font-semibold">
              Bloquear {selected.otherMember.username}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Vocês não poderão mais trocar mensagens ou se encontrar nas
              buscas. A pessoa não será avisada.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBlockOpen(false)}
                className="rounded-xl border border-black/12 px-4 py-3 text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void blockConversation()}
                className="rounded-xl bg-[var(--ruby)] px-4 py-3 text-sm font-bold text-white"
              >
                Bloquear
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </main>
  );
}

function Avatar({ conversation }: { conversation: Conversation }) {
  const photo = conversation.otherMember.photos[0]?.dataUrl;
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--gold-soft)]/35 text-[var(--gold)]">
      {photo ? (
        // Profile photos are user-provided data URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-5 w-5" />
      )}
      {isOnline(conversation.otherMember.lastActiveAt) ? (
        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--emerald)]" />
      ) : null}
    </span>
  );
}

function MessageList({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[];
  currentUserId?: string;
}) {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => {
        const mine = message.senderId === currentUserId;
        const day = formatDayKey(message.createdAt);
        const previousDay =
          index > 0 ? formatDayKey(messages[index - 1].createdAt) : "";
        const showDay = day !== previousDay;
        return (
          <div key={message.id}>
            {showDay ? (
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-black/8" />
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-black/35">
                  {formatDayLabel(message.createdAt)}
                </span>
                <span className="h-px flex-1 bg-black/8" />
              </div>
            ) : null}
            <div className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-5 shadow-sm sm:max-w-[68%]",
                  mine
                    ? "rounded-br-md bg-[var(--emerald)] text-white"
                    : "rounded-bl-md border border-black/8 bg-white text-[var(--black)]",
                ].join(" ")}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <span
                  className={[
                    "mt-1 flex items-center justify-end gap-1 text-[0.62rem]",
                    mine ? "text-white/65" : "text-black/38",
                  ].join(" ")}
                >
                  {formatMessageTime(message.createdAt)}
                  {mine ? (
                    message.readAt ? (
                      <CheckCheck className="h-3.5 w-3.5 text-[#b8e9de]" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportDialog({
  conversation,
  messages,
  onClose,
  onReported,
}: {
  conversation: Conversation;
  messages: ChatMessage[];
  onClose: () => void;
  onReported: (blocked: boolean) => void;
}) {
  const [category, setCategory] = useState("HARASSMENT");
  const [details, setDetails] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [blockUser, setBlockUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const reportableMessages = messages.slice(-30);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(conversation.id)}/reports`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          details,
          messageIds: selectedMessages,
          blockUser,
        }),
      },
    ).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(result?.message ?? "Não foi possível enviar a denúncia.");
      setSubmitting(false);
      return;
    }
    onReported(blockUser);
  }

  return (
    <ModalShell onClose={onClose} wide>
      <form onSubmit={submit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ruby)]">
              Segurança
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              Denunciar conversa
            </h2>
            <p className="mt-1 text-sm text-black/50">
              Selecione as mensagens que ajudam a equipe a entender o caso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold">
          Motivo
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-black/12 bg-white px-3 outline-none focus:border-[var(--gold)]"
          >
            {reportCategories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold">
            Mensagens relacionadas (opcional)
          </legend>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-black/10 bg-[#fcfaf6] p-2">
            {reportableMessages.length ? (
              reportableMessages.map((message) => (
                <label
                  key={message.id}
                  className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-xs hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={(event) =>
                      setSelectedMessages((current) =>
                        event.target.checked
                          ? [...current, message.id]
                          : current.filter((id) => id !== message.id),
                      )
                    }
                    className="mt-0.5 accent-[var(--ruby)]"
                  />
                  <span className="line-clamp-2 flex-1">{message.body}</span>
                  <span className="text-black/35">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </label>
              ))
            ) : (
              <p className="p-3 text-xs text-black/45">
                Não há mensagens recentes para selecionar.
              </p>
            )}
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-bold">
          Conte mais detalhes (opcional)
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-black/12 p-3 text-sm outline-none focus:border-[var(--gold)]"
          />
        </label>

        <label className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--ruby)]/5 p-3 text-sm">
          <input
            type="checkbox"
            checked={blockUser}
            onChange={(event) => setBlockUser(event.target.checked)}
            className="mt-0.5 accent-[var(--ruby)]"
          />
          <span>
            <strong className="block">Bloquear este perfil também</strong>
            <span className="text-xs text-black/50">
              A troca de mensagens será interrompida imediatamente.
            </span>
          </span>
        </label>

        {error ? (
          <p className="mt-3 text-sm font-semibold text-[var(--ruby)]">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-[var(--ruby)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Enviando…" : "Enviar denúncia com segurança"}
        </button>
      </form>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "w-full rounded-3xl bg-white p-5 shadow-2xl sm:p-6",
          wide ? "max-w-xl" : "max-w-md",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function StateMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-32 place-items-center p-5 text-center text-sm leading-6 text-black/48">
      {children}
    </div>
  );
}

function deduplicateMessages(messages: ChatMessage[]) {
  return Array.from(
    new Map(messages.map((message) => [message.id, message])).values(),
  );
}

function isOnline(value: string | null) {
  return Boolean(
    value && Date.now() - new Date(value).getTime() < 5 * 60 * 1000,
  );
}

function formatConversationTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? formatMessageTime(value)
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date);
}

function formatMessageTime(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDayKey(value: string | null) {
  return value ? new Date(value).toDateString() : "";
}

function formatDayLabel(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(date);
}
