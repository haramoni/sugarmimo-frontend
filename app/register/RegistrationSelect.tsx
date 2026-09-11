"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldMessage } from "../components/FormFeedback";

export function RegistrationSelect({
  id, label, value, onValueChange, options, required = true,
  placeholder = "Selecione uma opção",
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}) {
  const message = required && !value ? "Selecione uma opção." : undefined;
  return (
    <div className="registration-field">
      <Label htmlFor={id} className="registration-label">{label}</Label>
      <Select name={id} value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger id={id} className="registration-select-trigger" aria-invalid={Boolean(message)} aria-describedby={message ? `${id}-message` : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="registration-select-content">
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
      <FormFieldMessage id={id} message={message} />
    </div>
  );
}
