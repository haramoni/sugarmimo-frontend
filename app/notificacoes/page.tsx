"use client";

import { Bell, ChevronDown, Heart, Loader2, MapPin, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Navbar } from "../components/ui/Navbar";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";
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
    photos?: Array<{ id: string }>;
  };
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const isApprovalPending = shouldShowPendingApproval(user);
  const visibleItems = showAll ? items : items.slice(0, 6);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

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
  }, [isApprovalPending, isAuthLoading, router, user]);

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

  if (isAuthLoading) {
    return <PremiumLoadingScreen label="Carregando suas notificações..." />;
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="premium-page-shell">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-7 sm:px-6">
          <div className="premium-surface-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="premium-icon-medallion h-11 w-11 rounded-full">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-luxury-ivory">Notificações</h1>
                <p className="text-sm font-semibold text-luxury-muted">
                  Likes e liberações de contato aparecem aqui.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {isLoading ? (
                <div className="flex min-h-36 items-center justify-center gap-2 text-sm font-bold text-luxury-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-luxury-champagne" />
                  Carregando notificações...
                </div>
              ) : error ? (
                <p className="rounded-lg border border-ruby/50 bg-ruby/10 p-4 text-sm font-bold text-[#f0a5b3]">
                  {error}
                </p>
              ) : items.length === 0 ? (
                <p className="rounded-lg border border-luxury-gold/25 bg-luxury-black/60 p-5 text-sm font-semibold text-luxury-muted">
                  Você ainda não recebeu notificações.
                </p>
              ) : (
                visibleItems.map((notification) => {
                  const isLike = notification.type !== "CONTACTS_RELEASED";
                  const isBabyLikeAndRelease =
                    notification.type === "BABY_LIKE_AND_RELEASE";
                  const location = [
                    notification.actor.city,
                    notification.actor.state,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const photoId = notification.actor.photos?.[0]?.id;
                  const photo = photoId
                    ? `/api/match-photos/${encodeURIComponent(photoId)}?variant=card&v=3`
                    : null;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotification(notification)}
                      className={[
                        "flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-luxury-champagne",
                        notification.readAt
                          ? "border-luxury-gold/18 bg-luxury-black/48"
                          : "border-luxury-gold/48 bg-luxury-gold/10",
                      ].join(" ")}
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-champagne">
                        {photo ? (
                          // The authenticated proxy serves a compact card image.
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
                        <span className="block font-extrabold text-luxury-ivory">
                          @{notification.actor.username}
                        </span>
                        <span className="block text-sm font-semibold text-luxury-muted">
                          {isBabyLikeAndRelease
                            ? "Curtiu seu perfil e liberou os contatos para você."
                            : isLike
                              ? "Curtiu seu perfil. Veja o perfil e decida se deseja liberar seus contatos."
                              : "Liberou os contatos para você."}
                        </span>
                        {location ? (
                          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-luxury-muted/75">
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

            {!isLoading && !error && items.length > 6 && !showAll ? (
              <div className="mt-5 flex justify-center border-t border-luxury-gold/18 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="premium-secondary-action inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition"
                >
                  Ver todas as notificações
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}
