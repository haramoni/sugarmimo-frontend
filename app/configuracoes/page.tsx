"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { useAuth } from "../components/AuthProvider";
import { Navbar } from "../components/ui/Navbar";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, isAuthLoading, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!strongPassword.test(newPassword)) {
      setError(
        "A nova senha precisa ter 8 caracteres ou mais, com maiúscula, minúscula, número e caractere especial.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível alterar a senha.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Senha alterada com sucesso.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError("");

    if (deleteConfirmation !== "EXCLUIR") {
      setDeleteError('Digite "EXCLUIR" para confirmar.');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: deletePassword }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível excluir a conta.");
      }

      await logout();
      router.replace("/");
      router.refresh();
    } catch (submissionError) {
      setDeleteError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível excluir a conta.",
      );
      setIsDeleting(false);
    }
  }

  if (isAuthLoading || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--gold-soft)_24%,transparent),transparent_34%),var(--background)]">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--gold)]">
            Sua conta
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--black)] sm:text-4xl">
            Configurações
          </h1>
          <p className="mt-2 max-w-2xl text-[color:color-mix(in_srgb,var(--black)_60%,var(--silver))]">
            Consulte o e-mail da sua conta e mantenha sua senha atualizada.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <article className="h-fit rounded-[2rem] border border-[color:color-mix(in_srgb,var(--gold)_26%,transparent)] bg-white/72 p-6 shadow-[0_22px_55px_rgba(20,17,14,0.08)] backdrop-blur-xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:color-mix(in_srgb,var(--emerald)_12%,white)] text-[var(--emerald)]">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-serif text-xl font-semibold text-[var(--black)]">
              E-mail de acesso
            </h2>
            <p className="mt-2 text-sm text-[color:color-mix(in_srgb,var(--black)_55%,var(--silver))]">
              Este é o e-mail vinculado à sua conta.
            </p>
            <div className="mt-5 break-all rounded-2xl border border-[color:color-mix(in_srgb,var(--silver)_38%,transparent)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--black)]">
              {user.email || "E-mail não disponível"}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[color:color-mix(in_srgb,var(--gold)_26%,transparent)] bg-white/72 p-6 shadow-[0_22px_55px_rgba(20,17,14,0.08)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[color:color-mix(in_srgb,var(--gold-soft)_35%,white)] text-[var(--gold)]">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[var(--black)]">
                  Alterar senha
                </h2>
                <p className="mt-1 text-sm text-[color:color-mix(in_srgb,var(--black)_55%,var(--silver))]">
                  Confirme sua senha atual antes de escolher uma nova.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-12 rounded-xl border-[color:color-mix(in_srgb,var(--silver)_45%,transparent)] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 rounded-xl border-[color:color-mix(in_srgb,var(--silver)_45%,transparent)] bg-white"
                />
                <p className="flex items-start gap-2 text-xs leading-relaxed text-[color:color-mix(in_srgb,var(--black)_52%,var(--silver))]">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Use ao menos 8 caracteres, com maiúscula, minúscula, número e
                  caractere especial.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 rounded-xl border-[color:color-mix(in_srgb,var(--silver)_45%,transparent)] bg-white"
                />
              </div>

              <div aria-live="polite" className="min-h-6 text-sm font-semibold">
                {error ? <p className="text-[var(--ruby)]">{error}</p> : null}
                {success ? (
                  <p className="flex items-center gap-2 text-[var(--emerald)]">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-[var(--emerald)] px-6 font-extrabold text-white hover:bg-[color:color-mix(in_srgb,var(--emerald)_84%,black)] sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {isSubmitting ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </article>
        </div>

        <article className="mt-6 rounded-[2rem] border border-[color:color-mix(in_srgb,var(--ruby)_34%,transparent)] bg-[color:color-mix(in_srgb,var(--ruby)_4%,white)] p-6 shadow-[0_22px_55px_rgba(20,17,14,0.06)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] text-[var(--ruby)]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--black)]">
                Excluir conta
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--black)_58%,var(--silver))]">
                Esta ação é permanente. Seu perfil, suas fotos, conversas e
                demais dados vinculados à conta serão removidos.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleDeleteAccount}
            className="mt-7 grid gap-5 lg:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="delete-password">Senha atual</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                required
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                className="h-12 rounded-xl border-[color:color-mix(in_srgb,var(--ruby)_30%,transparent)] bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Digite EXCLUIR para confirmar
              </Label>
              <Input
                id="delete-confirmation"
                type="text"
                autoComplete="off"
                required
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className="h-12 rounded-xl border-[color:color-mix(in_srgb,var(--ruby)_30%,transparent)] bg-white"
              />
            </div>

            <div
              aria-live="polite"
              className="min-h-6 text-sm font-semibold text-[var(--ruby)] lg:col-span-2"
            >
              {deleteError}
            </div>

            <div className="lg:col-span-2">
              <Button
                type="submit"
                disabled={
                  isDeleting ||
                  !deletePassword ||
                  deleteConfirmation !== "EXCLUIR"
                }
                className="h-12 rounded-full bg-[var(--ruby)] px-6 font-extrabold text-white hover:bg-[color:color-mix(in_srgb,var(--ruby)_82%,black)]"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Excluindo..." : "Excluir minha conta"}
              </Button>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
