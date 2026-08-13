"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { AccountMenu } from "./AccountMenu";

const menuItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Blog", href: "/blog" },
  { label: "Notificações", href: "/notificacoes" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const canSearch = ["SUGAR_BABY", "SUGAR_DADDY"].includes(
    user?.role?.trim().toUpperCase() ?? "",
  );
  const loggedMenuItems = canSearch
    ? [
        menuItems[0],
        { label: "Buscar", href: "/buscar" },
        { label: "Chat", href: "/chat" },
        { label: "Clube VIP", href: "/clube-vip" },
        menuItems[1],
        menuItems[2],
      ]
    : menuItems;
  const profilePhoto = user?.photos
    ?.filter((photo) => !photo.isPrivate)
    ?.slice()
    .sort(
      (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
    )[0];

  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true;

    async function loadUnreadNotifications() {
      const response = await fetch("/api/interactions/notifications", {
        cache: "no-store",
      }).catch(() => null);

      if (!response?.ok) {
        return;
      }

      const result = await response.json().catch(() => null);
      if (isActive) {
        setUnreadNotifications(
          typeof result?.unreadCount === "number" ? result.unreadCount : 0,
        );
      }
    }

    void loadUnreadNotifications();
    const interval = window.setInterval(loadUnreadNotifications, 30_000);
    window.addEventListener("focus", loadUnreadNotifications);
    window.addEventListener(
      "sugarmimo-notifications-updated",
      loadUnreadNotifications,
    );

    return () => {
      isActive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadUnreadNotifications);
      window.removeEventListener(
        "sugarmimo-notifications-updated",
        loadUnreadNotifications,
      );
    };
  }, [user]);

  useEffect(() => {
    if (!user || !canSearch) {
      return;
    }

    let isActive = true;
    async function loadUnreadChat() {
      const response = await fetch("/api/chat/conversations", {
        cache: "no-store",
      }).catch(() => null);
      if (!response?.ok || !isActive) {
        return;
      }
      const conversations = (await response.json().catch(() => [])) as Array<{
        unreadCount?: number;
      }>;
      setUnreadChat(
        conversations.reduce(
          (total, conversation) => total + (conversation.unreadCount ?? 0),
          0,
        ),
      );
    }

    void loadUnreadChat();
    const interval = window.setInterval(loadUnreadChat, 30_000);
    window.addEventListener("focus", loadUnreadChat);
    window.addEventListener("sugarmimo-chat-updated", loadUnreadChat);
    return () => {
      isActive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadUnreadChat);
      window.removeEventListener("sugarmimo-chat-updated", loadUnreadChat);
    };
  }, [canSearch, user]);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_88%,white)] px-4 py-3 shadow-[0_10px_34px_rgba(20,17,14,0.08)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <nav className="mx-auto grid max-w-7xl items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="group flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--emerald)]"
        >
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--gold)_54%,var(--silver))] bg-[linear-gradient(145deg,var(--surface),color-mix(in_srgb,var(--gold-soft)_24%,white))] shadow-[0_12px_28px_rgba(185,138,56,0.14)] transition duration-300 group-hover:border-[var(--emerald)]">
            <span className="absolute inset-1 rounded-full border border-[color-mix(in_srgb,var(--silver)_58%,transparent)]" />
            <Image
              src="/sm-icon.png"
              alt="SugarMimo"
              width={38}
              height={38}
              priority
              className="relative h-8 w-8 object-contain"
            />
          </span>

          <span className="leading-none">
            <span className="block font-serif text-2xl font-semibold text-[var(--black)] transition duration-300 group-hover:text-silver">
              Sugar<span className="text-[var(--gold)]">Mimo</span>
            </span>
            <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--black)_52%,var(--silver))] sm:block">
              Private Social Club
            </span>
          </span>
        </Link>

        <div className="order-3 flex gap-1.5 overflow-x-auto justify-center rounded-full border border-[color:color-mix(in_srgb,var(--silver)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_78%,white)] p-1.5 text-sm font-bold text-[color-mix(in_srgb,var(--black)_68%,var(--silver))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_16px_42px_rgba(20,17,14,0.08)] backdrop-blur-2xl lg:order-none lg:justify-center">
          {loggedMenuItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative shrink-0 rounded-full px-4 py-2.5 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emerald)]",
                  active
                    ? "bg-silver text-white shadow-[0_10px_24px_rgba(0,108,88,0.22)]"
                    : "hover:bg-[color:color-mix(in_srgb,var(--gold-soft)_28%,white)] hover:text-[var(--black)]",
                ].join(" ")}
              >
                <span className="relative z-10">{item.label}</span>
                {item.href === "/notificacoes" &&
                user &&
                unreadNotifications > 0 ? (
                  <span
                    title={`${unreadNotifications} notificação${unreadNotifications === 1 ? "" : "ões"} não lida${unreadNotifications === 1 ? "" : "s"}`}
                    className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ruby shadow-[0_0_0_2px_rgba(190,35,62,0.14)]"
                  >
                    <span className="sr-only">
                      {unreadNotifications} notificações não lidas
                    </span>
                  </span>
                ) : null}
                {item.href === "/chat" && unreadChat > 0 ? (
                  <span
                    title={`${unreadChat} mensagem${unreadChat === 1 ? "" : "s"} não lida${unreadChat === 1 ? "" : "s"}`}
                    className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ruby shadow-[0_0_0_2px_rgba(190,35,62,0.14)]"
                  >
                    <span className="sr-only">
                      {unreadChat} mensagens não lidas
                    </span>
                  </span>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-[linear-gradient(90deg,var(--silver),var(--gold-soft),white)]" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-self-end gap-5">
          {user ? (
            <Link
              href="/perfil"
              aria-label="Abrir meu perfil"
              className="flex items-center gap-2"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald/12 text-emerald">
                {profilePhoto?.dataUrl ? (
                  // User uploads are data URLs and should not use Next image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profilePhoto.dataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </span>
              <span className="max-w-20 truncate sm:max-w-28">
                {user.username || "Meu perfil"}
              </span>
            </Link>
          ) : null}
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
