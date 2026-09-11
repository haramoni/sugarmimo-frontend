export function getLoginErrors(identifier: string, password: string) {
  const login = identifier.trim();
  return {
    identifier: !login
      ? "Informe seu nome de usuário ou e-mail."
      : login.length > 255
        ? "Use no máximo 255 caracteres."
        : login.includes("@") && !isValidEmail(login)
          ? "Confira o e-mail. Exemplo: nome@email.com."
          : undefined,
    password: !password.trim()
      ? "Informe sua senha."
      : password.length < 6
        ? "A senha deve ter pelo menos 6 caracteres."
        : password.length > 128
          ? "A senha deve ter no máximo 128 caracteres."
          : undefined,
  };
}

export function isValidEmail(value: string) {
  return value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

export function getPhoneError(value: string) {
  if (!value.trim()) return "Informe o celular, incluindo o DDD.";
  return /^\+?\d{10,15}$/.test(normalizePhone(value)) && /^[+\d\s().-]+$/.test(value.trim())
    ? undefined
    : "Informe um celular válido, incluindo o DDD.";
}

export function getBirthDateError(day: string, month: string, year: string, today = new Date()) {
  if (!day || !month || !year) return "Selecione dia, mês e ano de nascimento.";
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) {
    return "Informe uma data de nascimento válida.";
  }
  const age = today.getFullYear() - date.getFullYear() -
    (today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate()) ? 1 : 0);
  return age < 18 ? "O cadastro é permitido apenas para maiores de 18 anos." : undefined;
}

export function getRegistrationAccessErrors({ username, email, accountPhone, password }: {
  username: string; email: string; accountPhone: string; password: string;
}) {
  return {
    username: !username
      ? "Informe um nome de usuário."
      : username.length < 2 || username.length > 30
        ? "Use de 2 a 30 caracteres no nome de usuário."
        : !/^[A-Za-z0-9._-]+$/.test(username)
          ? "Use letras, números, ponto, hífen ou sublinhado, sem espaços."
          : undefined,
    email: !email ? "Informe um e-mail." : !isValidEmail(email) ? "Informe um e-mail válido." : undefined,
    accountPhone: getPhoneError(accountPhone),
    password: getRegistrationPasswordError(password),
  };
}

function getRegistrationPasswordError(password: string) {
  if (!password) return "Informe uma senha.";
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (password.length > 128) return "A senha deve ter no máximo 128 caracteres.";
  if (!/[A-Z]/.test(password)) return "Inclua pelo menos uma letra maiúscula.";
  if (!/[a-z]/.test(password)) return "Inclua pelo menos uma letra minúscula.";
  if (!/\d/.test(password)) return "Inclua pelo menos um número.";
  if (!/[^A-Za-z\d]/.test(password)) return "Inclua pelo menos um caractere especial.";
  if (/[\r\n]/.test(password)) return "A senha não pode conter quebras de linha.";
  return undefined;
}
