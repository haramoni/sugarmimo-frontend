"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ContactForm({
  initialCategory = "ATENDIMENTO",
}: {
  initialCategory?: string;
}) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus({ type: "idle" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string | string[]; protocol?: string }
        | null;

      if (!response.ok) {
        const responseMessage = Array.isArray(result?.message)
          ? result.message[0]
          : result?.message;
        throw new Error(responseMessage || "Não foi possível enviar a mensagem.");
      }

      form.reset();
      setStatus({
        type: "success",
        message: result?.protocol
          ? `Solicitação recebida. Guarde o protocolo ${result.protocol}.`
          : "Solicitação recebida! Nossa equipe responderá pelo seu e-mail.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar. Tente novamente.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const fieldClassName =
    "premium-field mt-2 min-h-12 w-full rounded-xl px-4 py-3 text-base outline-none transition";

  return (
    <form
      onSubmit={handleSubmit}
      className="premium-surface-card mx-auto mt-12 max-w-3xl rounded-2xl p-6 sm:p-10"
    >
      <div className="text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-luxury-champagne">
          Fale com a gente
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-luxury-ivory">
          Envie uma mensagem
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-luxury-muted">
          Preencha os campos abaixo e responderemos diretamente no e-mail informado.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="text-sm font-bold text-luxury-ivory">
          Nome
          <input
            className={fieldClassName}
            type="text"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            placeholder="Como podemos chamar você?"
          />
        </label>

        <label className="text-sm font-bold text-luxury-ivory">
          E-mail
          <input
            className={fieldClassName}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
            placeholder="voce@exemplo.com"
          />
        </label>
      </div>

      <label className="mt-6 block text-sm font-bold text-luxury-ivory">
        Tipo de solicitação
        <Select
          name="category"
          defaultValue={initialCategory}
          required
        >
          <SelectTrigger className="premium-field mt-2 h-12 w-full rounded-xl px-4 text-base [&_svg]:text-luxury-champagne">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="premium-select-content rounded-lg border border-luxury-gold/45 bg-luxury-surface-raised p-1 text-luxury-ivory shadow-[0_22px_48px_rgba(0,0,0,0.48)]"
          >
            <SelectItem value="ATENDIMENTO" className="rounded-md focus:bg-luxury-gold/18 focus:text-luxury-champagne">Atendimento geral</SelectItem>
            <SelectItem value="RECLAMACAO" className="rounded-md focus:bg-luxury-gold/18 focus:text-luxury-champagne">Reclamação</SelectItem>
            <SelectItem value="CANCELAMENTO" className="rounded-md focus:bg-luxury-gold/18 focus:text-luxury-champagne">Cancelamento</SelectItem>
            <SelectItem value="PRIVACIDADE" className="rounded-md focus:bg-luxury-gold/18 focus:text-luxury-champagne">Privacidade e LGPD</SelectItem>
            <SelectItem value="DENUNCIA" className="rounded-md focus:bg-luxury-gold/18 focus:text-luxury-champagne">Denúncia e segurança</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="mt-6 block text-sm font-bold text-luxury-ivory">
        Assunto
        <input
          className={fieldClassName}
          type="text"
          name="subject"
          minLength={3}
          maxLength={120}
          required
          placeholder="Sobre o que deseja falar?"
        />
      </label>

      <label className="mt-6 block text-sm font-bold text-luxury-ivory">
        Mensagem
        <textarea
          className={`${fieldClassName} min-h-40 resize-y`}
          name="message"
          minLength={10}
          maxLength={5000}
          required
          placeholder="Conte como podemos ajudar..."
        />
      </label>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-7 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={isSending}
          className="premium-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSending ? (
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-5 w-5" aria-hidden="true" />
          )}
          {isSending ? "Enviando..." : "Enviar mensagem"}
        </button>

        <div className="min-h-6 text-center" aria-live="polite">
          {status.type === "success" ? (
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#78d6c0]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              {status.message}
            </p>
          ) : status.type === "error" ? (
            <p className="text-sm font-bold text-[#f0a5b3]" role="alert">
              {status.message}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
