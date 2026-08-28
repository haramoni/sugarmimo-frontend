"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { PremiereOfferDialog } from "../../perfil/PremiereOfferDialog";
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
  const canBecomePremiere =
    user?.role?.trim().toUpperCase() === "SUGAR_DADDY" && !user.isPremiere;
  const loggedMenuItems = canSearch
    ? [
        menuItems[0],
        { label: "Buscar", href: "/buscar" },
        { label: "Pins", href: "/pins" },
        { label: "Chat", href: "/chat" },
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
      if (document.visibilityState !== "visible") {
        return;
      }

      const response = await fetch(
        "/api/interactions/notifications/unread-count",
        {
          cache: "no-store",
        },
      ).catch(() => null);

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
    const interval = window.setInterval(loadUnreadNotifications, 60_000);
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
      if (document.visibilityState !== "visible") {
        return;
      }

      const response = await fetch("/api/chat/unread-count", {
        cache: "no-store",
      }).catch(() => null);
      if (!response?.ok || !isActive) {
        return;
      }
      const result = (await response.json().catch(() => null)) as {
        unreadCount?: number;
        unreadPeopleCount?: number;
      } | null;
      setUnreadChat(
        typeof result?.unreadPeopleCount === "number"
          ? result.unreadPeopleCount
          : typeof result?.unreadCount === "number"
            ? result.unreadCount
            : 0,
      );
    }

    void loadUnreadChat();
    const interval = window.setInterval(loadUnreadChat, 60_000);
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
    <header className="sticky top-0 z-50 border-b border-[#e1bd8a]/15 bg-[#080808]/92 px-4 py-3 text-[#f4ecdf] shadow-[0_12px_38px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <nav className="mx-auto grid max-w-7xl items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="group flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a]"
        >
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#e1bd8a]/35 bg-[#11100e] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition duration-300 group-hover:border-[#e1bd8a]/75">
            <span className="absolute inset-1 rounded-full border border-[#e1bd8a]/14" />
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
            <span className="block font-serif text-2xl font-semibold text-[#f4ecdf] transition duration-300 group-hover:text-[#e1bd8a]">
              Sugar<span className="text-[#e1bd8a]">Mimo</span>
            </span>
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[#77736d] sm:block">
              Private Social Club
            </span>
          </span>
        </Link>

        <div className="order-3 flex justify-center gap-1.5 overflow-x-auto rounded-full border border-[#e1bd8a]/14 bg-[#11100e]/88 p-1.5 text-sm font-bold text-[#99958d] shadow-[0_16px_42px_rgba(0,0,0,0.2)] backdrop-blur-2xl lg:order-none lg:justify-center">
          {loggedMenuItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative shrink-0 rounded-full px-4 py-2.5 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e1bd8a]",
                  active
                    ? "bg-[#e1bd8a] text-[#080808] shadow-[0_10px_24px_rgba(225,189,138,0.18)]"
                    : "hover:bg-[#e1bd8a]/10 hover:text-[#e1bd8a]",
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
                    title={`${unreadChat} pessoa${unreadChat === 1 ? "" : "s"} com ${unreadChat === 1 ? "mensagem não lida" : "mensagens não lidas"}`}
                    className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-ruby px-1 text-[0.6rem] font-extrabold leading-none text-white shadow-[0_1px_4px_rgba(190,35,62,0.22)]"
                  >
                    <span aria-hidden="true">
                      {unreadChat > 99 ? "99+" : unreadChat}
                    </span>
                    <span className="sr-only">
                      {`${unreadChat} pessoa${unreadChat === 1 ? "" : "s"} com ${unreadChat === 1 ? "mensagem não lida" : "mensagens não lidas"}`}
                    </span>
                  </span>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-[#705127]" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-self-end gap-5">
          {canBecomePremiere ? (
            <PremiereOfferDialog triggerVariant="navbar" />
          ) : null}
          {user ? (
            <Link
              href="/perfil"
              aria-label="Abrir meu perfil"
              className="flex items-center gap-2"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e1bd8a]/28 bg-[#11100e] text-[#e1bd8a]">
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
              <span className="hidden max-w-36 truncate rounded-md px-2 py-1 text-sm font-bold text-[#e6ded1] transition duration-200 hover:text-[#e1bd8a] sm:block">
                <span>Olá, {user.username}</span>
                <br />
                <span className="text-xs text-[#e1bd8a]">Minha Conta</span>
              </span>
            </Link>
          ) : null}
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
