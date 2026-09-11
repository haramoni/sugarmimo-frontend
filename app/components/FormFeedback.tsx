"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import styles from "./FormFeedback.module.css";

export type FormIssue = { id: string; label: string; message?: string };

export function focusFormField(id: string) {
  const target = document.getElementById(id);
  const control = target?.matches("input, button, select, textarea")
    ? target
    : target?.querySelector<HTMLElement>("input, button, select, textarea");
  (control ?? target)?.focus();
  target?.scrollIntoView({ block: "center", behavior: "instant" });
}

export function FormFieldMessage({ id, message, as: Tag = "p" }: {
  id: string;
  message?: string;
  as?: "p" | "span";
}) {
  return message ? (
    <Tag id={`${id}-message`} className={styles.message} data-form-feedback="message">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </Tag>
  ) : null;
}

export function FormProgress({
  issues,
  readyMessage = "Tudo preenchido. Você já pode continuar.",
  busyMessage,
}: {
  issues: FormIssue[];
  readyMessage?: string;
  busyMessage?: string;
}) {
  const pending = issues.filter((issue) => issue.message);
  return (
    <div className={styles.progress} data-form-feedback="progress">
      <p role="status" className={styles.status}>
        {pending.length ? (
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
        )}
        <span>
          {busyMessage || (pending.length
            ? `${pending.length === 1 ? "Falta revisar 1 item" : `Faltam revisar ${pending.length} itens`} para continuar.`
            : readyMessage)}
        </span>
      </p>
      {pending.length > 0 && (
        <ul className={styles.items} aria-label="Campos pendentes">
          {pending.map(({ id, label }) => (
            <li key={id}>
              <button type="button" onClick={() => focusFormField(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
