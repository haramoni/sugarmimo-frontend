"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PROFILE_FRAME_DETAILS,
  resolveProfileFrame,
} from "../../lib/membership";
import { getProviderProfilePlaceholder } from "../../lib/profileIdentity";
import { useAuth } from "../AuthProvider";
import { PremiereOfferDialog } from "../../perfil/PremiereOfferDialog";
import { AccountMenu } from "./AccountMenu";

const menuItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Planos", href: "/planos" },
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
  const isSugarDaddy = user?.role?.trim().toUpperCase() === "SUGAR_DADDY";
  const canBecomePremiere = isSugarDaddy && !user.isPremiere;
  const loggedMenuItems = canSearch
    ? [
        menuItems[0],
        { label: "Buscar", href: "/buscar" },
        { label: "Pins", href: "/pins" },
        { label: "Chat", href: "/chat" },
        ...(isSugarDaddy ? [menuItems[1]] : []),
        menuItems[2],
      ]
    : menuItems;
  const profilePhoto = user?.photos
    ?.filter((photo) => !photo.isPrivate)
    ?.slice()
    .sort(
      (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
    )[0];
  const profileFrame = user ? resolveProfileFrame(user) : "STANDARD";
  const providerPlaceholder = user
    ? getProviderProfilePlaceholder(user.role, user.gender)
    : null;

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
    <header className="sticky top-0 z-50 border-b border-[#b98a38]/35 bg-[#030302]/96 px-4 py-3 text-[#f5ead7] shadow-[0_12px_38px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <nav className="mx-auto flex flex-wrap justify-between max-w-7xl items-center gap-x-3 gap-y-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-4">
        <Link href="/" aria-label="SugarMimo" className="inline-flex w-fit">
          <Image
            src="/brand/logo-dark-bg.webp"
            alt="SugarMimo"
            width={180}
            height={42}
            className="h-auto w-28 object-contain sm:w-40"
          />
        </Link>

        <div className="order-3 col-span-2 flex w-full justify-center gap-1 overflow-x-auto rounded-full border border-[#b98a38]/60 bg-[#050504]/96 p-1 text-xs font-bold text-[#aaa39a] shadow-[0_16px_42px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(225,189,138,0.03)] backdrop-blur-2xl sm:justify-center sm:gap-1.5 sm:p-1.5 sm:text-sm xl:order-none xl:col-span-1 xl:w-auto">
          {loggedMenuItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const isPlansCallout = item.href === "/planos";

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative shrink-0 rounded-full px-3 py-2 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e1bd8a] sm:px-4 sm:py-2.5",
                  isPlansCallout
                    ? "border border-[#ff8798] bg-[linear-gradient(180deg,#f34460_0%,#cf1538_55%,#970b26_100%)] text-white shadow-[0_0_20px_rgba(239,42,76,0.62),0_8px_22px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,220,225,0.38)] ring-1 ring-[#ffbac4]/25 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-[#ff8798]"
                    : active
                      ? "bg-[linear-gradient(180deg,#f8dda0_0%,#dfb767_58%,#c9923d_100%)] text-[#1a1209] shadow-[0_0_18px_rgba(225,189,138,0.58),0_8px_20px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,249,224,0.72)]"
                      : "hover:bg-[#b98a38]/12 hover:text-[#e7c579]",
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
                {active && !isPlansCallout ? (
                  <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-[#75431f]" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-self-end gap-2 sm:gap-3 xl:col-start-auto xl:row-start-auto xl:gap-5">
          {canBecomePremiere ? (
            <PremiereOfferDialog triggerVariant="navbar" />
          ) : null}
          {user ? (
            <Link
              href="/perfil"
              aria-label="Abrir meu perfil"
              className="flex items-center gap-2"
            >
              <span
                className={`navbar-membership-avatar navbar-membership-avatar--${profileFrame.toLowerCase()}`}
                title={`Moldura ${PROFILE_FRAME_DETAILS[profileFrame].label}`}
              >
                <span className="navbar-membership-avatar-photo grid place-items-center overflow-hidden rounded-full bg-[#050504] text-[#d9ac55]">
                  {profilePhoto?.dataUrl ? (
                    // User uploads are data URLs and should not use Next image optimization.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhoto.dataUrl}
                      alt=""
                      className="h-11 w-11 object-cover"
                    />
                  ) : providerPlaceholder ? (
                    <Image
                      src={providerPlaceholder}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </span>
                {profileFrame === "ELITE" ? (
                  <>
                    <span className="navbar-membership-avatar-accent navbar-membership-avatar-accent--top" />
                    <span className="navbar-membership-avatar-accent navbar-membership-avatar-accent--bottom" />
                  </>
                ) : null}
              </span>
              <span className="hidden max-w-36 truncate rounded-md px-2 py-1 text-sm font-bold text-[#d8d1c6] transition duration-200 hover:text-[#e7c579] md:block">
                <span>Olá, {user.username}</span>
                <br />
                <span className="text-xs text-[#d6aa54]">Minha Conta</span>
              </span>
            </Link>
          ) : null}
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
