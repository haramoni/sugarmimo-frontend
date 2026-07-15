"use client";

import { Bell, Heart, Loader2, MapPin, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Navbar } from "../components/ui/Navbar";
import { useAuth } from "../components/AuthProvider";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

type NotificationItem = {
  id: string;
  type: "LIKE_RECEIVED" | "CONTACTS_RELEASED" | "BABY_LIKE_AND_RELEASE";
  readAt?: string | null;
  createdAt?: string | null;
  actor: {
    id: string;
    username: string;
    role?: string | null;
    city?: string | null;
    state?: string | null;
    photos?: Array<{ dataUrl: string }>;
  };
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (isApprovalPending) {
      return;
    }

    const controller = new AbortController();
    fetch("/api/interactions/notifications", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            result?.message ?? "Não foi possível carregar as notificações.",
          );
        }
        return Array.isArray(result?.items)
          ? (result.items as NotificationItem[])
          : [];
      })
      .then((notifications) => {
        if (!controller.signal.aborted) {
          setItems(notifications);
        }
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar as notificações.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isApprovalPending, router, user]);

  async function openNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      const response = await fetch(
        `/api/interactions/notifications/${encodeURIComponent(notification.id)}/read`,
        { method: "PATCH" },
      ).catch(() => null);

      if (response?.ok) {
        window.dispatchEvent(new Event("sugarmimo-notifications-updated"));
      }
    }

    router.push(`/perfil/${encodeURIComponent(notification.actor.username)}`);
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[url('/wallpaper-marble.png')] bg-cover bg-fixed bg-center text-black-jewel">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-7 sm:px-6">
          <div className="rounded-lg border border-emerald/24 bg-[color-mix(in_srgb,var(--surface)_92%,white)] p-4 shadow-[0_22px_58px_rgba(20,17,14,0.12)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald text-white">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold">Notificações</h1>
                <p className="text-sm font-semibold text-black-jewel/62">
                  Likes e liberações de contato aparecem aqui.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {isLoading ? (
                <div className="flex min-h-36 items-center justify-center gap-2 text-sm font-bold text-black-jewel/62">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald" />
                  Carregando notificações...
                </div>
              ) : error ? (
                <p className="rounded-sm bg-ruby/10 p-4 text-sm font-bold text-ruby">
                  {error}
                </p>
              ) : items.length === 0 ? (
                <p className="rounded-sm border border-emerald/20 bg-white/74 p-5 text-sm font-semibold text-black-jewel/62">
                  Você ainda não recebeu notificações.
                </p>
              ) : (
                items.map((notification) => {
                  const isLike = notification.type !== "CONTACTS_RELEASED";
                  const isBabyLikeAndRelease =
                    notification.type === "BABY_LIKE_AND_RELEASE";
                  const location = [
                    notification.actor.city,
                    notification.actor.state,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const photo = notification.actor.photos?.[0]?.dataUrl;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotification(notification)}
                      className={[
                        "flex min-w-0 items-center gap-3 rounded-sm border p-3 text-left shadow-[0_10px_22px_rgba(0,55,44,0.07)] transition hover:border-emerald",
                        notification.readAt
                          ? "border-silver/60 bg-white/68"
                          : "border-emerald/38 bg-[color-mix(in_srgb,var(--emerald)_7%,white)]",
                      ].join(" ")}
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald/10 text-emerald">
                        {photo ? (
                          // User uploads are data URLs.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : isLike ? (
                          <Heart className="h-5 w-5" />
                        ) : (
                          <Unlock className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold text-black-jewel">
                          @{notification.actor.username}
                        </span>
                        <span className="block text-sm font-semibold text-black-jewel/68">
                          {isBabyLikeAndRelease
                            ? "Curtiu seu perfil e liberou os contatos para você."
                            : isLike
                              ? "Curtiu seu perfil. Veja o perfil e decida se deseja liberar seus contatos."
                              : "Liberou os contatos para você."}
                        </span>
                        {location ? (
                          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-black-jewel/50">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}
