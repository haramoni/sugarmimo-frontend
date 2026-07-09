"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, LogOut, RefreshCw, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";

type ActivityLog = {
  id: string;
  userId: string | null;
  action: string;
  method: string;
  path: string;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    role: string | null;
  } | null;
};

const LIMIT_OPTIONS = [50, 100, 250, 500];

export default function AdminActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [limit, setLimit] = useState(100);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    const token = localStorage.getItem("sugarmimo:admin-token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/activity-logs?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sugarmimo:admin-token");
        router.push("/admin/login");
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Nao foi possivel carregar logs.");
      }

      setLogs(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar logs.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadLogs(), 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLogs]);

  function logout() {
    localStorage.removeItem("sugarmimo:admin-token");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--black)]">
      <header className="border-b border-[var(--platinum)] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={190}
            height={64}
            style={{ height: "auto" }}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Aprovar perfis"
              onClick={() => router.push("/admin/approvals")}
              className="rounded-sm"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atualizar logs"
              onClick={() => void loadLogs()}
              className="rounded-sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={logout}
              className="rounded-sm"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-5 px-5 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <ClipboardList className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">Auditoria</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold">Logs de atividade</h1>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold">
            Mostrar
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="h-10 rounded-sm border border-[var(--platinum)] bg-white px-3 text-sm font-bold outline-none"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
            {error}
          </p>
        )}

        <div className="overflow-x-auto border border-[var(--platinum)] bg-white">
          <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
            <thead className="bg-[color:color-mix(in_srgb,var(--gold-soft)_34%,white)] text-xs uppercase text-[color:color-mix(in_srgb,var(--black)_70%,transparent)]">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Acao</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Metodo</th>
                <th className="px-4 py-3">Rota</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 font-bold">
                    Carregando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 font-bold">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-[var(--platinum)] align-top"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-bold">{log.action}</td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <span className="block max-w-40 break-words">
                          {log.user.username}
                          <span className="block text-xs text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]">
                            {log.user.role ?? "-"}
                          </span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-14 justify-center rounded-sm bg-[var(--black)] px-2 py-1 text-xs font-bold text-white">
                        {log.method}
                      </span>
                    </td>
                    <td className="max-w-72 break-words px-4 py-3 font-mono text-xs">
                      {log.path}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      <span
                        className={
                          log.statusCode && log.statusCode >= 400
                            ? "text-[var(--ruby)]"
                            : "text-[var(--emerald)]"
                        }
                      >
                        {log.statusCode ?? "-"}
                      </span>
                    </td>
                    <td className="max-w-36 break-words px-4 py-3">
                      {log.ip ?? "-"}
                    </td>
                    <td className="max-w-80 px-4 py-3 font-mono text-xs">
                      <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words">
                        {formatMetadata(log.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatMetadata(value: Record<string, unknown> | null) {
  if (!value) {
    return "-";
  }

  return JSON.stringify(value, null, 2);
}
