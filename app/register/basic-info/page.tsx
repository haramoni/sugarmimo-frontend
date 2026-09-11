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
import { FormFieldMessage, FormProgress, focusFormField } from "../../components/FormFeedback";
import { getBirthDateError, getRegistrationAccessErrors, normalizePhone } from "../../lib/form-validation";

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
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
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
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [state, setState] = useState(savedPayload.state);
  const [city, setCity] = useState(savedPayload.city);
  const [locationError, setLocationError] = useState("");
  const [locationAttempt, setLocationAttempt] = useState(0);
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAccountPhone = normalizePhone(accountPhone);
  const clientErrors = useMemo(
    () =>
      getRegistrationAccessErrors({
        username: normalizedUsername,
        email: normalizedEmail,
        accountPhone,
        password,
      }),
    [accountPhone, normalizedEmail, normalizedUsername, password],
  );
  const fieldErrors = {
    username: clientErrors.username ?? availabilityErrors.username,
    email: clientErrors.email ?? availabilityErrors.email,
    accountPhone: clientErrors.accountPhone,
    password: clientErrors.password,
    birthDate: getBirthDateError(birthDay, birthMonth, birthYear),
    country: !country ? "Selecione o país." : undefined,
    state: !state ? "Selecione o estado." : undefined,
    city: !city ? (state ? "Selecione a cidade." : "Selecione primeiro o estado e depois a cidade.") : undefined,
    source: !source ? "Selecione onde conheceu a SugarMimo." : undefined,
  };
  const issues = [
    { id: "username", label: "Nome de usuário", message: fieldErrors.username },
    { id: "email", label: "E-mail", message: fieldErrors.email },
    { id: "account-phone", label: "Celular", message: fieldErrors.accountPhone },
    { id: "password", label: "Senha", message: fieldErrors.password },
    { id: "birth-date", label: "Nascimento", message: fieldErrors.birthDate },
    { id: "country", label: "País", message: fieldErrors.country },
    { id: "state", label: "Estado", message: fieldErrors.state },
    { id: "city", label: "Cidade", message: fieldErrors.city },
    { id: "source", label: "Como nos conheceu", message: fieldErrors.source },
  ];
  const firstIssue = issues.find((issue) => issue.message);
  const availabilityConfirmed = availabilityCheck?.username === normalizedUsername &&
    availabilityCheck?.email === normalizedEmail &&
    availabilityCheck.usernameAvailable === true && availabilityCheck.emailAvailable === true;
  const canContinue = !firstIssue && availabilityConfirmed && !isCheckingAvailability && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) {
      if (firstIssue) focusFormField(firstIssue.id);
      return;
    }

    const stepOne = JSON.parse(
      localStorage.getItem(REGISTER_STEP_ONE_KEY) ?? "{}",
    );
    const currentPayload = JSON.parse(
      localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );
    delete currentPayload.password;

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

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_STEP_ONE_KEY)) {
      router.replace("/register");
      return;
    }

    setRegisterStep("/register/basic-info");
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
      { signal: controller.signal },
    )
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((result: IbgeState[]) => { if (!controller.signal.aborted) setStates(result); })
      .catch(() => { if (!controller.signal.aborted) setLocationError("Não foi possível carregar os estados. Tente novamente."); });
    return () => controller.abort();
  }, [locationAttempt]);

  useEffect(() => {
    if (!state) {
      return;
    }

    const controller = new AbortController();
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`,
      { signal: controller.signal },
    )
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((result: IbgeCity[]) => { if (!controller.signal.aborted) setCities(result); })
      .catch(() => { if (!controller.signal.aborted) setLocationError("Não foi possível carregar as cidades. Tente novamente."); });
    return () => controller.abort();
  }, [state, locationAttempt]);

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
        if (controller.signal.aborted) return;

        setAvailabilityError("");
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
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setAvailabilityError("Não foi possível validar o usuário e o e-mail agora. Tente novamente.");
        setAvailabilityCheck(null);
      } finally {
        if (!controller.signal.aborted) setIsCheckingAvailability(false);
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
    availabilityAttempt,
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
              onClick={() => {
                setRegisterStep("/register");
                router.push("/register");
              }}
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

        <form className="registration-account-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="contents">
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
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? "username-message" : undefined}
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
                    if (sanitizeUsername(event.target.value) === normalizedUsername) return;
                    setAvailabilityCheck(null);
                    setIsCheckingAvailability(false);
                    setAvailabilityError("");
                    setAvailabilityErrors((currentErrors) => ({
                      ...currentErrors,
                      username: undefined,
                    }));
                  }}
                  placeholder="Escolha um nome para seu perfil"
                    className="registration-input"
                />
                </div>

                <FormFieldMessage id="username" message={fieldErrors.username} />
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
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-message" : undefined}
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    if (event.target.value.trim().toLowerCase() === normalizedEmail) return;
                    setAvailabilityCheck(null);
                    setIsCheckingAvailability(false);
                    setAvailabilityError("");
                    setAvailabilityErrors((currentErrors) => ({
                      ...currentErrors,
                      email: undefined,
                    }));
                  }}
                  placeholder="Ex.: nome@email.com.br"
                    className="registration-input"
                />
                </div>

                <FormFieldMessage id="email" message={fieldErrors.email} />
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
                  aria-invalid={Boolean(fieldErrors.accountPhone)}
                  aria-describedby={fieldErrors.accountPhone ? "account-phone-message" : undefined}
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

                <FormFieldMessage id="account-phone" message={fieldErrors.accountPhone} />
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
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-requirements password-message" : "password-requirements"}
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
                  aria-pressed={showPassword}
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

                <p id="password-requirements" className="registration-helper">
                  Mínimo de 8 caracteres, com maiúscula, minúscula, número e
                  caractere especial.
                </p>

                <FormFieldMessage id="password" message={fieldErrors.password} />
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

                <div id="birth-date" className="grid grid-cols-3 gap-2 sm:gap-3">
                <Select value={birthDay} onValueChange={setBirthDay} required>
                    <SelectTrigger aria-label="Dia de nascimento" aria-invalid={Boolean(fieldErrors.birthDate)} aria-describedby={fieldErrors.birthDate ? "birth-date-message" : undefined} className="registration-select-trigger">
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
                    <SelectTrigger aria-label="Mês de nascimento" aria-invalid={Boolean(fieldErrors.birthDate)} aria-describedby={fieldErrors.birthDate ? "birth-date-message" : undefined} className="registration-select-trigger">
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
                    <SelectTrigger aria-label="Ano de nascimento" aria-invalid={Boolean(fieldErrors.birthDate)} aria-describedby={fieldErrors.birthDate ? "birth-date-message" : undefined} className="registration-select-trigger">
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
                <FormFieldMessage id="birth-date" message={fieldErrors.birthDate} />
              </div>

              <div className="registration-location-grid">
                <div className="registration-field">
                  <Label htmlFor="country" className="registration-label">País</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger id="country" aria-invalid={Boolean(fieldErrors.country)} aria-describedby={fieldErrors.country ? "country-message" : undefined} className="registration-select-trigger">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent className="registration-select-content">
                      <SelectItem value="brasil">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormFieldMessage id="country" message={fieldErrors.country} />
                </div>

                <div className="registration-field">
                  <Label htmlFor="state" className="registration-label">Estado</Label>
                  <Select
                    value={state}
                    onValueChange={handleStateChange}
                    required
                  >
                    <SelectTrigger id="state" aria-invalid={Boolean(fieldErrors.state)} aria-describedby={fieldErrors.state ? "state-message" : undefined} className="registration-select-trigger">
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
                  <FormFieldMessage id="state" message={fieldErrors.state} />
                </div>
              </div>

              <div className="registration-field">
                <Label htmlFor="city" className="registration-label">Cidade</Label>
                <Select
                  value={city}
                  onValueChange={setCity}
                  required
                  disabled={!state}
                >
                  <SelectTrigger id="city" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-message" : undefined} className="registration-select-trigger">
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
                <FormFieldMessage id="city" message={fieldErrors.city} />
              </div>

              <div className="registration-field">
                <Label htmlFor="source" className="registration-label">
                  Onde ouviu sobre a SugarMimo?
                </Label>
                <Select value={source} onValueChange={setSource} required>
                  <SelectTrigger id="source" aria-invalid={Boolean(fieldErrors.source)} aria-describedby={fieldErrors.source ? "source-message" : undefined} className="registration-select-trigger">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="registration-select-content">
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
                <FormFieldMessage id="source" message={fieldErrors.source} />
              </div>
            </div>
          </section>

          <div className="registration-account-actions">
            <div className="min-w-0 flex-1 space-y-3">
              <FormProgress issues={issues} busyMessage={
                isSubmitting ? "Validando seus dados..." :
                !firstIssue && !availabilityConfirmed
                  ? (availabilityError ? "Valide o usuário e e-mail para continuar." : "Conferindo a disponibilidade do usuário e e-mail...") : undefined
              } />
              <StatusMessage error={error || availabilityError} isCheckingAvailability={isCheckingAvailability} />
              {availabilityError && (
                <Button type="button" variant="outline" onClick={() => {
                  setAvailabilityError("");
                  setAvailabilityAttempt((attempt) => attempt + 1);
                }}>Tentar validar novamente</Button>
              )}
              {locationError && (
                <div className="space-y-2">
                  <div role="alert"><FormFieldMessage id="location-error" message={locationError} /></div>
                  <Button type="button" variant="outline" onClick={() => {
                    setLocationError("");
                    setLocationAttempt((attempt) => attempt + 1);
                  }}>Recarregar localização</Button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canContinue}
              className="registration-submit"
            >
              {isSubmitting ? "Validando..." : "Continuar Cadastro"}
            </Button>
          </div>
          </fieldset>
        </form>
      </div>
    </main>
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

  if (!response.ok || !availability ||
    typeof availability.usernameAvailable !== "boolean" ||
    typeof availability.emailAvailable !== "boolean") {
    throw new Error("Não foi possível validar seus dados. Tente novamente.");
  }

  return availability;
}

function sanitizeUsername(value: string) {
  if (value.includes("@")) {
    return "";
  }

  return value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 30);
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
    birthDay: birthDay ? String(Number(birthDay)) : "",
    birthMonth,
    birthYear,
    country: String(payload.country ?? "brasil"),
    state: String(payload.state ?? ""),
    city: String(payload.city ?? ""),
    source: String(payload.source ?? ""),
  };
}
