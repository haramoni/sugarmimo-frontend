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
import { useRouter, useSearchParams } from "next/navigation";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";
const DEFAULT_FREE_MESSAGE_LIMIT = 50;
const CHAT_MONITORING_NOTICE_TEXT =
  "Mensagens e interações poderão ser analisadas por mecanismos automatizados e/ou pessoas autorizadas para apuração de denúncias e cumprimento legal, conforme a Política de Privacidade.";

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

type MessageAccess = {
  canSend: boolean;
  isTrial: boolean;
  freeMessagesLimit: number | null;
  freeMessagesUsed: number | null;
  freeMessagesRemaining: number | null;
  requiresUpgrade: boolean;
};

type MonitoringNotice = {
  version: string;
  text: string;
  privacyUrl: string;
  required: boolean;
  acknowledgedAt: string | null;
};

export function ChatClient() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
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
  const [messageAccess, setMessageAccess] = useState<MessageAccess | null>(
    null,
  );
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false);
  const [monitoringNotice, setMonitoringNotice] =
    useState<MonitoringNotice | null>(null);
  const [loadingMonitoringNotice, setLoadingMonitoringNotice] = useState(false);
  const [acknowledgingNotice, setAcknowledgingNotice] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const conversationMenuRef = useRef<HTMLDivElement | null>(null);

  const selected = conversations.find(({ id }) => id === selectedId) ?? null;
  const isStandardDaddy =
    user?.role?.trim().toUpperCase() === "SUGAR_DADDY" &&
    !user.isPremium &&
    !user.isPremiere;
  const canSendMessages =
    !isStandardDaddy || Boolean(messageAccess?.freeMessagesRemaining);
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
    const sorted = sortConversationsByLatestMessage(result);
    setConversations(sorted);
    setSelectedId((current) => current ?? sorted[0]?.id ?? null);
    setLoadingConversations(false);
  }, []);

  const loadMessageAccess = useCallback(async () => {
    const response = await fetch("/api/chat/message-access", {
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) {
      return;
    }
    setMessageAccess((await response.json()) as MessageAccess);
  }, []);

  const loadMonitoringNotice = useCallback(async (conversationId: string) => {
    setLoadingMonitoringNotice(true);
    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(conversationId)}/monitoring-notice`,
      { cache: "no-store" },
    ).catch(() => null);
    if (selectedIdRef.current !== conversationId) {
      return;
    }
    if (!response?.ok) {
      setMonitoringNotice({
        version: "",
        text: CHAT_MONITORING_NOTICE_TEXT,
        privacyUrl: "/privacy",
        required: true,
        acknowledgedAt: null,
      });
      setError(
        "Não foi possível confirmar o aviso de privacidade desta conversa.",
      );
      setLoadingMonitoringNotice(false);
      return;
    }
    setMonitoringNotice((await response.json()) as MonitoringNotice);
    setLoadingMonitoringNotice(false);
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadConversations();
      void loadMessageAccess();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthLoading, loadConversations, loadMessageAccess, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user || !openWithUserId) {
      return;
    }
    void (async () => {
      const response = await fetch(
        `/api/chat/conversations/with/${encodeURIComponent(openWithUserId)}`,
        { method: "POST" },
      ).catch(() => null);
      if (!response?.ok) {
        const result = await response?.json().catch(() => null);
        setError(result?.message ?? "Não foi possível abrir esta conversa.");
        return;
      }
      const result = (await response.json()) as { id: string };
      await loadConversations();
      setSelectedId(result.id);
    })();
  }, [isAuthLoading, loadConversations, openWithUserId, user]);

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
        prepend
          ? deduplicateMessages([...result.items, ...current])
          : result.items,
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
        setMonitoringNotice(null);
        setLoadingMonitoringNotice(false);
        return;
      }
      setMenuOpen(false);
      void loadMessages(selectedId);
      void loadMonitoringNotice(selectedId);
      void markRead(selectedId);
      socketRef.current?.emit("conversation:join", {
        conversationId: selectedId,
      });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadMessages, loadMonitoringNotice, markRead, selectedId]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    let active = true;
    const socket = io(`${API_URL}/chat`, {
      autoConnect: false,
      // Prefer WebSocket to avoid long-polling overhead, while retaining polling
      // as a fallback for temporary network/proxy incompatibilities.
      transports: ["websocket", "polling"],
      auth: async (callback) => {
        const response = await fetch("/api/chat/socket-ticket", {
          method: "POST",
        }).catch(() => null);
        if (!response?.ok || !active) {
          callback({ token: "" });
          return;
        }
        const { token } = (await response.json()) as { token: string };
        callback({ token });
      },
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
    socket.on("conversation:blocked", (event: { conversationId: string }) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === event.conversationId
            ? { ...conversation, blocked: true }
            : conversation,
        ),
      );
    });
    socket.connect();
    return () => {
      active = false;
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [loadConversations, markRead, user?.id]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeMenuOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !conversationMenuRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function closeMenuOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    document.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [menuOpen]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    if (
      !selectedId ||
      !draft.trim() ||
      sending ||
      selected?.blocked ||
      !canSendMessages ||
      loadingMonitoringNotice ||
      monitoringNotice?.required
    ) {
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
      if (response?.status === 403 && isStandardDaddy) {
        await loadMessageAccess();
        setUpgradeAlertOpen(true);
      } else if (response?.status === 412 && selectedId) {
        await loadMonitoringNotice(selectedId);
      }
    } else {
      const message = (await response.json()) as ChatMessage & {
        freeMessagesRemaining?: number | null;
      };
      setMessages((current) => deduplicateMessages([...current, message]));
      if (
        isStandardDaddy &&
        typeof message.freeMessagesRemaining === "number"
      ) {
        const remaining = message.freeMessagesRemaining;
        setMessageAccess((current) => ({
          canSend: remaining > 0,
          isTrial: true,
          freeMessagesLimit:
            current?.freeMessagesLimit ?? DEFAULT_FREE_MESSAGE_LIMIT,
          freeMessagesUsed:
            (current?.freeMessagesLimit ?? DEFAULT_FREE_MESSAGE_LIMIT) -
            remaining,
          freeMessagesRemaining: remaining,
          requiresUpgrade: remaining === 0,
        }));
        if (remaining === 0) {
          setUpgradeAlertOpen(true);
        }
      }
      await loadConversations();
      window.setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        20,
      );
    }
    setSending(false);
  }

  async function acknowledgeMonitoringNotice() {
    if (!selectedId || acknowledgingNotice) {
      return;
    }
    setAcknowledgingNotice(true);
    setError("");
    const response = await fetch(
      `/api/chat/conversations/${encodeURIComponent(selectedId)}/monitoring-notice/acknowledge`,
      { method: "POST" },
    ).catch(() => null);
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setError(
        result?.message ?? "Não foi possível registrar a ciência do aviso.",
      );
      setAcknowledgingNotice(false);
      return;
    }
    const result = (await response.json()) as {
      version: string;
      acknowledgedAt: string;
    };
    setMonitoringNotice((current) => ({
      version: result.version,
      text: current?.text ?? CHAT_MONITORING_NOTICE_TEXT,
      privacyUrl: current?.privacyUrl ?? "/privacy",
      required: false,
      acknowledgedAt: result.acknowledgedAt,
    }));
    setAcknowledgingNotice(false);
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
                            : (conversation.lastMessage?.body ??
                              "Comece a conversa")}
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
                    Selecione uma conversa. As mensagens são protegidas e
                    removidas automaticamente após 60 dias.
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
                  <div ref={conversationMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((current) => !current)}
                      aria-label="Opções da conversa"
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      className="grid h-11 w-11 place-items-center rounded-full border border-transparent text-black/60 transition hover:border-black/8 hover:bg-black/5 hover:text-black"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {menuOpen ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_55px_rgba(20,17,14,0.18)]"
                      >
                        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
                          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-black/40">
                            Ações da conversa
                          </span>
                          <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Fechar opções da conversa"
                            className="grid h-8 w-8 place-items-center rounded-full text-black/45 hover:bg-black/5 hover:text-black"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReportOpen(true);
                            setMenuOpen(false);
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[var(--ruby)]/5"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ruby)]/8 text-[var(--ruby)]">
                            <Flag className="h-4 w-4" />
                          </span>
                          Denunciar conversa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBlockOpen(true);
                            setMenuOpen(false);
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[var(--ruby)] hover:bg-[var(--ruby)]/5"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ruby)]/8">
                            <Ban className="h-4 w-4" />
                          </span>
                          Bloquear perfil
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>

                <details className="group border-b border-black/5 bg-[var(--emerald)]/[0.035] text-black/55">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center gap-2 px-4 py-2 text-center text-[0.7rem] font-semibold marker:hidden hover:bg-[var(--emerald)]/[0.025]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--emerald)]" />
                    <span>
                      Mensagens protegidas · histórico de até 60 dias
                    </span>
                    <ChevronUp className="h-3.5 w-3.5 rotate-180 transition group-open:rotate-0" />
                  </summary>
                  <div className="border-t border-black/5 px-5 py-3 text-center text-[0.7rem] leading-5">
                    {monitoringNotice?.text ?? CHAT_MONITORING_NOTICE_TEXT}{" "}
                    <Link
                      href={monitoringNotice?.privacyUrl ?? "/privacy"}
                      className="font-bold text-[var(--emerald)] underline underline-offset-2"
                    >
                      Política de Privacidade
                    </Link>
                  </div>
                </details>

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
                        Comece uma conversa
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
                  {isStandardDaddy &&
                  messageAccess?.isTrial &&
                  canSendMessages ? (
                    <div className="mb-2 rounded-xl border border-[var(--gold)]/25 bg-[var(--gold-soft)]/15 px-3 py-2 text-center text-xs font-semibold text-black/58">
                      Você ainda tem {messageAccess.freeMessagesRemaining} de{" "}
                      {messageAccess.freeMessagesLimit} mensagens gratuitas.
                    </div>
                  ) : null}
                  {selected.blocked ? (
                    <div className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-semibold text-black/50">
                      Esta conversa está bloqueada.
                    </div>
                  ) : loadingMonitoringNotice ? (
                    <div className="rounded-2xl border border-black/8 bg-black/[0.025] px-4 py-3 text-center text-sm font-semibold text-black/50">
                      Verificando o aviso de privacidade…
                    </div>
                  ) : monitoringNotice?.required ? (
                    <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold-soft)]/15 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--emerald)]" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            Aviso de privacidade do chat
                          </p>
                          <p className="mt-1 text-xs leading-5 text-black/58">
                            {monitoringNotice.text}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              disabled={acknowledgingNotice}
                              onClick={() =>
                                void acknowledgeMonitoringNotice()
                              }
                              className="rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {acknowledgingNotice
                                ? "Registrando…"
                                : "Li e estou ciente"}
                            </button>
                            <Link
                              href={monitoringNotice.privacyUrl}
                              className="text-xs font-bold text-[var(--emerald)] underline underline-offset-2"
                            >
                              Ler a Política de Privacidade
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !canSendMessages ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold-soft)]/20 px-4 py-3 text-center text-sm font-semibold text-black/60">
                      <LockKeyhole className="h-4 w-4 text-[var(--gold)]" />
                      {isStandardDaddy && !messageAccess
                        ? "Carregando suas mensagens gratuitas…"
                        : `Você já enviou as ${messageAccess?.freeMessagesLimit ?? DEFAULT_FREE_MESSAGE_LIMIT} mensagens gratuitas. Faça upgrade para continuar conversando.`}
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

      {upgradeAlertOpen ? (
        <ModalShell
          onClose={() => setUpgradeAlertOpen(false)}
          ariaLabel="Limite de mensagens"
        >
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--gold-soft)]/30 text-[var(--gold)]">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-serif text-2xl font-semibold">
              Mensagens gratuitas utilizadas
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Você já enviou suas{" "}
              {messageAccess?.freeMessagesLimit ?? DEFAULT_FREE_MESSAGE_LIMIT}
              {" "}mensagens de teste. Faça um upgrade para Premium ou Premiere
              para continuar enviando e respondendo mensagens sem esse limite.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setUpgradeAlertOpen(false)}
                className="rounded-xl border border-black/12 px-4 py-3 text-sm font-bold"
              >
                Agora não
              </button>
              <Link
                href="/perfil"
                className="rounded-xl bg-[var(--gold)] px-4 py-3 text-sm font-bold text-white"
              >
                Fazer upgrade
              </Link>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {blockOpen && selected ? (
        <ModalShell
          onClose={() => setBlockOpen(false)}
          ariaLabel="Bloquear perfil"
        >
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

function sortConversationsByLatestMessage(conversations: Conversation[]) {
  return [...conversations].sort((first, second) => {
    const firstMessageAt = toTimestamp(first.lastMessage?.createdAt);
    const secondMessageAt = toTimestamp(second.lastMessage?.createdAt);

    if (firstMessageAt !== secondMessageAt) {
      return secondMessageAt - firstMessageAt;
    }

    return toTimestamp(second.updatedAt) - toTimestamp(first.updatedAt);
  });
}

function toTimestamp(value?: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function Avatar({ conversation }: { conversation: Conversation }) {
  const photoId = conversation.otherMember.photos[0]?.id;
  const photo = photoId
    ? `/api/match-photos/${encodeURIComponent(photoId)}?variant=card&v=2`
    : null;
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--gold-soft)]/35 text-[var(--gold)]">
      {photo ? (
        // The authenticated proxy serves a compact card-sized variant.
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
                <p className="whitespace-pre-wrap break-words">
                  {message.body}
                </p>
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
    <ModalShell onClose={onClose} ariaLabel="Denunciar conversa" wide>
      <form onSubmit={submit}>
        <div className="sticky top-0 z-10 -mx-1 flex items-start justify-between gap-4 border-b border-black/8 bg-white px-1 pb-4 pt-1">
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
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-black/55 shadow-sm transition hover:border-black/20 hover:bg-black/5 hover:text-black"
          >
            <X className="h-5 w-5" />
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
          <p className="mt-3 text-sm font-semibold text-[var(--ruby)]">
            {error}
          </p>
        ) : null}
        <div className="sticky bottom-0 -mx-1 mt-5 grid grid-cols-[0.8fr_1.2fr] gap-3 border-t border-black/8 bg-white px-1 pb-1 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/12 px-4 py-3 text-sm font-bold text-black/60 transition hover:bg-black/5 hover:text-black"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[var(--ruby)] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar denúncia"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  ariaLabel,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
  wide?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current();
        }
      }}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/45 px-3 pb-4 pt-20 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={[
          "max-h-[calc(100dvh-6rem)] w-full overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] sm:p-6",
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
