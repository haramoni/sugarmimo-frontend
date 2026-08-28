"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStoredReferralUsername,
  REGISTER_PAYLOAD_KEY,
  REGISTER_STEP_ONE_KEY,
  setRegisterStep,
} from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";
import { useRegistrationSecret } from "../RegistrationSecretProvider";

type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

type IbgeCity = {
  id: number;
  nome: string;
};

type AvailabilityResponse = {
  usernameAvailable?: boolean;
  emailAvailable?: boolean;
};

type AvailabilityCheck = AvailabilityResponse & {
  username: string;
  email: string;
};

type FieldErrors = {
  username?: string;
  email?: string;
  accountPhone?: string;
  password?: string;
};

export default function RegisterAccountForm() {
  const router = useRouter();
  const { password, setPassword } = useRegistrationSecret();
  const savedPayload = getSavedPayload();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [availabilityErrors, setAvailabilityErrors] = useState<FieldErrors>({});
  const [availabilityCheck, setAvailabilityCheck] =
    useState<AvailabilityCheck | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState(() =>
    sanitizeUsername(savedPayload.username),
  );
  const [email, setEmail] = useState(savedPayload.email);
  const [accountPhone, setAccountPhone] = useState(savedPayload.accountPhone);
  const [birthDay, setBirthDay] = useState(savedPayload.birthDay);
  const [birthMonth, setBirthMonth] = useState(savedPayload.birthMonth);
  const [birthYear, setBirthYear] = useState(savedPayload.birthYear);
  const [country, setCountry] = useState(savedPayload.country || "brasil");
  const [source, setSource] = useState(savedPayload.source);
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAccountPhone = normalizePhone(accountPhone);
  const clientErrors = useMemo(
    () =>
      getValidationErrors({
        username: normalizedUsername,
        email: normalizedEmail,
        accountPhone: normalizedAccountPhone,
        password,
      }),
    [normalizedAccountPhone, normalizedEmail, normalizedUsername, password],
  );
  const fieldErrors = {
    username: clientErrors.username ?? availabilityErrors.username,
    email: clientErrors.email ?? availabilityErrors.email,
    accountPhone: clientErrors.accountPhone,
    password: clientErrors.password,
  };
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stepOne = JSON.parse(
      localStorage.getItem(REGISTER_STEP_ONE_KEY) ?? "{}",
    );
    const currentPayload = JSON.parse(
      localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );
    delete currentPayload.password;
    const validationErrors = getValidationErrors({
      username: normalizedUsername,
      email: normalizedEmail,
      accountPhone: normalizedAccountPhone,
      password,
      showRequired: true,
    });

    if (Object.values(validationErrors).some(Boolean)) {
      setError(
        Object.values(validationErrors).find(Boolean) ??
          "Confira os dados informados.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const availability = await checkAccountAvailability(
        normalizedUsername,
        normalizedEmail,
      );
      setAvailabilityCheck({
        username: normalizedUsername,
        email: normalizedEmail,
        ...availability,
      });

      if (!availability.usernameAvailable) {
        setAvailabilityErrors((currentErrors) => ({
          ...currentErrors,
          username: "Este nome de usuário já está em uso.",
        }));
        return;
      }

      if (!availability.emailAvailable) {
        setAvailabilityErrors((currentErrors) => ({
          ...currentErrors,
          email: "Este e-mail já está sendo usado.",
        }));
        return;
      }

      const payload = {
        ...currentPayload,
        ...stepOne,
        referralUsername: getStoredReferralUsername(),
        username: normalizedUsername,
        email: normalizedEmail,
        accountPhone: normalizedAccountPhone,
        birthDate: `${birthYear}-${birthMonth}-${birthDay.padStart(2, "0")}`,
        country,
        state,
        city,
        source,
      };

      localStorage.setItem(REGISTER_PAYLOAD_KEY, JSON.stringify(payload));

      setRegisterStep("/register/how-you-are");
      router.push("/register/how-you-are");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível validar seus dados. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [state, setState] = useState(savedPayload.state);
  const [city, setCity] = useState(savedPayload.city);

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_STEP_ONE_KEY)) {
      router.replace("/register");
      return;
    }

    setRegisterStep("/register/basic-info");
  }, [router]);

  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
    )
      .then((res) => res.json())
      .then(setStates);
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`,
    )
      .then((res) => res.json())
      .then(setCities);
  }, [state]);

  useEffect(() => {
    if (
      clientErrors.username ||
      clientErrors.email ||
      !normalizedUsername ||
      !normalizedEmail
    ) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsCheckingAvailability(true);

      try {
        const availability = await checkAccountAvailability(
          normalizedUsername,
          normalizedEmail,
          controller.signal,
        );

        setAvailabilityCheck({
          username: normalizedUsername,
          email: normalizedEmail,
          ...availability,
        });
        setAvailabilityErrors((currentErrors) => ({
          ...currentErrors,
          username: availability.usernameAvailable
            ? undefined
            : "Este nome de usuário já está em uso.",
          email: availability.emailAvailable
            ? undefined
            : "Este e-mail já está sendo usado.",
        }));
      } catch (availabilityError) {
        if (availabilityError instanceof DOMException) {
          return;
        }

        setError("Não foi possível validar o usuário e o e-mail agora.");
        setAvailabilityCheck(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    clientErrors.email,
    clientErrors.username,
    normalizedEmail,
    normalizedUsername,
  ]);

  function handleStateChange(value: string) {
    setState(value);
    setCity("");
    setCities([]);
  }

  return (
    <main className="registration-stage">
      <div className="registration-account-card">
        <div className="registration-account-progress">
          <RegisterStepDots currentStep="/register/basic-info" />
        </div>

        <header className="registration-account-header">
          <div>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="registration-back-link"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao perfil
            </button>
            <p className="registration-eyebrow">
              <Lock className="h-3.5 w-3.5" />
              Etapa 2 de 6 · Conta privada
            </p>
            <h1>Crie sua conta</h1>
            <p>
              Seus dados de acesso e localização ficam protegidos e não são
              exibidos publicamente.
            </p>
          </div>

          <div className="registration-security-note">
            <ShieldCheck className="h-5 w-5" />
            <span>
              <strong>Ambiente seguro</strong>
              Validação individual de cada cadastro
            </span>
          </div>
        </header>

        <form className="registration-account-form" onSubmit={handleSubmit}>
          <section className="registration-form-section">
            <div className="registration-section-heading">
              <span>01</span>
              <div>
                <h2>Dados de acesso</h2>
                <p>Informações usadas para entrar na sua conta.</p>
              </div>
            </div>

            <div className="registration-fields-stack">
              <div className="registration-field">
                <Label htmlFor="username" className="registration-label">
                Nome de Usuário
                </Label>
                <p className="registration-helper">
                  Até 30 caracteres; use letras, números, ponto, hífen ou
                  sublinhado.
                </p>

                <div className="registration-control">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={2}
                  maxLength={30}
                  pattern="[A-Za-z0-9._-]+"
                  value={username}
                  onKeyDown={(event) => {
                    if (
                      event.key.length === 1 &&
                      !event.ctrlKey &&
                      !event.metaKey &&
                      !/^[A-Za-z0-9._-]$/.test(event.key)
                    ) {
                      event.preventDefault();
                      if (event.key === "@") {
                        setAvailabilityErrors((currentErrors) => ({
                          ...currentErrors,
                          username: "Não use seu e-mail como nome de usuário.",
                        }));
                      }
                    }
                  }}
                  onChange={(event) => {
                    if (event.target.value.includes("@")) {
                      setAvailabilityErrors((currentErrors) => ({
                        ...currentErrors,
                        username: "Não use seu e-mail como nome de usuário.",
                      }));
                      return;
                    }

                    setUsername(sanitizeUsername(event.target.value));
                    setError("");
                    setAvailabilityCheck(null);
                    setAvailabilityErrors((currentErrors) => ({
                      ...currentErrors,
                      username: undefined,
                    }));
                  }}
                  placeholder="Escolha um nome para seu perfil"
                    className="registration-input"
                />
                </div>

                <FieldMessage message={fieldErrors.username} />
              </div>

              <div className="registration-field">
                <Label htmlFor="email" className="registration-label">
                  E-mail
                </Label>

                <p className="registration-helper">
                  Usado apenas para autenticação, segurança e comunicações da
                  conta.
                </p>
                <div className="registration-control">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setAvailabilityCheck(null);
                    setAvailabilityErrors((currentErrors) => ({
                      ...currentErrors,
                      email: undefined,
                    }));
                  }}
                  placeholder="Ex.: nome@email.com.br"
                    className="registration-input"
                />
                </div>

                <FieldMessage message={fieldErrors.email} />
              </div>

              <div className="registration-field">
                <Label htmlFor="account-phone" className="registration-label">
                  Celular da conta
                </Label>

                <p className="registration-helper">
                  Uso privado para controle e segurança. Não será exibido no
                  site.
                </p>
                <div className="registration-control">
                <Input
                  id="account-phone"
                  name="accountPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={24}
                  value={accountPhone}
                  onChange={(event) => {
                    setAccountPhone(event.target.value);
                    setError("");
                  }}
                  placeholder="Ex.: +55 11 99999-9999"
                    className="registration-input"
                />
                </div>

                <FieldMessage message={fieldErrors.accountPhone} />
              </div>

              <div className="registration-field">
                <Label htmlFor="password" className="registration-label">
                  Senha
                </Label>

                <div className="registration-control">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Digite sua senha"
                    className="registration-input pr-12"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((value) => !value)}
                    className="registration-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                </div>

                <p className="registration-helper">
                  Mínimo de 8 caracteres, com maiúscula, minúscula, número e
                  caractere especial.
                </p>

                <FieldMessage message={fieldErrors.password} />
              </div>
            </div>
          </section>

          <section className="registration-form-section">
            <div className="registration-section-heading">
              <span>02</span>
              <div>
                <h2>Informações pessoais</h2>
                <p>Esses dados ajudam a manter a comunidade segura.</p>
              </div>
            </div>

            <div className="registration-fields-stack">
              <div className="registration-field">
                <p className="registration-label">Data de nascimento</p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Select value={birthDay} onValueChange={setBirthDay} required>
                    <SelectTrigger className="registration-select-trigger">
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    {Array.from({ length: 31 }, (_, index) => (
                      <SelectItem key={index + 1} value={String(index + 1)}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={birthMonth}
                  onValueChange={setBirthMonth}
                  required
                >
                    <SelectTrigger className="registration-select-trigger">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={birthYear} onValueChange={setBirthYear} required>
                    <SelectTrigger className="registration-select-trigger">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    {Array.from({ length: 83 }, (_, index) => {
                      const year = new Date().getFullYear() - 18 - index;

                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                </div>
              </div>

              <div className="registration-location-grid">
                <div className="registration-field">
                  <Label className="registration-label">País</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger className="registration-select-trigger">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent className="registration-select-content">
                      <SelectItem value="brasil">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="registration-field">
                  <Label className="registration-label">Estado</Label>
                  <Select
                    value={state}
                    onValueChange={handleStateChange}
                    required
                  >
                    <SelectTrigger className="registration-select-trigger">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="registration-select-content">
                      {states.map((uf) => (
                        <SelectItem key={uf.id} value={uf.sigla}>
                          {uf.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="registration-field">
                <Label className="registration-label">Cidade</Label>
                <Select
                  value={city}
                  onValueChange={setCity}
                  required
                  disabled={!state}
                >
                  <SelectTrigger className="registration-select-trigger">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    {cities.map((cidade) => (
                      <SelectItem key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="registration-field">
                <Label className="registration-label">
                  Onde ouviu sobre a SugarMimo?
                </Label>
                <Select value={source} onValueChange={setSource} required>
                  <SelectTrigger className="registration-select-trigger">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="registration-account-actions">
            <StatusMessage
              error={error}
              isCheckingAvailability={isCheckingAvailability}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="registration-submit"
            >
              {isSubmitting ? "Validando..." : "Continuar Cadastro"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className="registration-field-error"
    >
      {message}
    </p>
  );
}

function StatusMessage({
  error,
  isCheckingAvailability,
}: {
  error: string;
  isCheckingAvailability: boolean;
}) {
  const message =
    error || (isCheckingAvailability ? "Validando usuário e e-mail..." : "");

  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={[
        "registration-status-message",
        error ? "registration-status-error" : "",
      ].join(" ")}
    >
      {message}
    </p>
  );
}

async function checkAccountAvailability(
  username: string,
  email: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/auth/availability?${new URLSearchParams({
      username,
      email,
    })}`,
    { signal },
  );
  const availability = (await response
    .json()
    .catch(() => null)) as AvailabilityResponse | null;

  if (!response.ok || !availability) {
    throw new Error("Não foi possível validar seus dados. Tente novamente.");
  }

  return availability;
}

function getValidationErrors({
  username,
  email,
  accountPhone,
  password,
  showRequired = false,
}: {
  username: string;
  email: string;
  accountPhone: string;
  password: string;
  showRequired?: boolean;
}) {
  const errors: FieldErrors = {};

  if (showRequired && !username) {
    errors.username = "Informe um nome de usuário.";
  } else if (username && username.length < 2) {
    errors.username = "O nome de usuário deve ter pelo menos 2 caracteres.";
  } else if (username.length > 30) {
    errors.username = "O nome de usuário deve ter no máximo 30 caracteres.";
  } else if (username && !/^[A-Za-z0-9._-]+$/.test(username)) {
    errors.username =
      "Use apenas letras, números, ponto, hífen ou sublinhado, sem espaços.";
  }

  if (showRequired && !email) {
    errors.email = "Informe um e-mail.";
  } else if (email && !isValidEmail(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (showRequired && !accountPhone) {
    errors.accountPhone = "Informe o celular usado para controle da conta.";
  } else if (accountPhone && !/^\+?\d{10,15}$/.test(accountPhone)) {
    errors.accountPhone = "Informe um celular válido, incluindo o DDD.";
  }

  const passwordError = getPasswordError(password, showRequired);

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUsername(value: string) {
  if (value.includes("@")) {
    return "";
  }

  return value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 30);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

function getPasswordError(password: string, showRequired = false) {
  if (!password) {
    return showRequired ? "Informe uma senha." : undefined;
  }

  if (password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra minúscula.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve ter pelo menos um número.";
  }

  if (!/[^A-Za-z\d]/.test(password)) {
    return "A senha deve ter pelo menos um caractere especial.";
  }

  return undefined;
}

function getSavedPayload() {
  if (typeof window === "undefined") {
    return {
      username: "",
      email: "",
      accountPhone: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      country: "brasil",
      state: "",
      city: "",
      source: "",
    };
  }

  const payload = JSON.parse(
    window.localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
  ) as Record<string, string | boolean | undefined>;
  const [birthYear = "", birthMonth = "", birthDay = ""] = String(
    payload.birthDate ?? "",
  ).split("-");

  return {
    username: String(payload.username ?? ""),
    email: String(payload.email ?? ""),
    accountPhone: String(payload.accountPhone ?? ""),
    birthDay,
    birthMonth,
    birthYear,
    country: String(payload.country ?? "brasil"),
    state: String(payload.state ?? ""),
    city: String(payload.city ?? ""),
    source: String(payload.source ?? ""),
  };
}
