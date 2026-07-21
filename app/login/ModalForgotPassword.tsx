"use client";

import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ModalForgotPassword() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setEmail("");
      setError("");
      setSuccess("");
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Muitas tentativas. Aguarde um pouco antes de tentar novamente.",
          );
        }

        throw new Error(
          String(result?.message || "Não foi possível enviar o e-mail."),
        );
      }

      setSuccess(
        "Se o e-mail estiver cadastrado, a nova senha será enviada em instantes. Verifique também a caixa de spam.",
      );
      setEmail("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar o e-mail.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="mt-3 p-0" variant="link">
          Esqueceu sua senha?
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recuperar senha</DialogTitle>
          <DialogDescription>
            Digite seu e-mail cadastrado para receber uma nova senha temporária.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="forgot-password-email">E-mail</Label>
            <Input
              id="forgot-password-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemplo@email.com"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-sm bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
            >
              {success}
            </p>
          )}

          <Button className="bg-gold" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar nova senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
