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
        "Se o e-mail estiver cadastrado, um link seguro será enviado. Ele vale por 30 minutos e só pode ser usado uma vez.",
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
        <Button
          className="mt-3 p-0 text-[#99958d] hover:text-[#e1bd8a]"
          variant="link"
        >
          Esqueceu sua senha?
        </Button>
      </DialogTrigger>

      <DialogContent className="border-[#e1bd8a]/18 bg-[#11100e] text-[#f4ecdf]">
        <DialogHeader>
          <DialogTitle>Recuperar senha</DialogTitle>
          <DialogDescription>
            Digite seu e-mail cadastrado para receber um link seguro de
            redefinição. Sua senha atual não será alterada até você usar o link.
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
              className="border-[#e1bd8a]/18 bg-[#080808] text-[#f4ecdf] placeholder:text-[#716e68] focus-visible:border-[#e1bd8a]/60 focus-visible:ring-[#e1bd8a]/20"
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

          <Button
            className="rounded-full bg-[#e1bd8a] text-[#080808] hover:bg-[#f3d7aa]"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar link seguro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
