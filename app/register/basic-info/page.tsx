"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  REGISTER_PAYLOAD_KEY,
  REGISTER_STEP_ONE_KEY,
  setRegisterStep,
} from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";

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
  password?: string;
};

export default function RegisterAccountForm() {
  const router = useRouter();
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
  const [password, setPassword] = useState(savedPayload.password);
  const [birthDay, setBirthDay] = useState(savedPayload.birthDay);
  const [birthMonth, setBirthMonth] = useState(savedPayload.birthMonth);
  const [birthYear, setBirthYear] = useState(savedPayload.birthYear);
  const [country, setCountry] = useState(savedPayload.country || "brasil");
  const [source, setSource] = useState(savedPayload.source);
  const [termsAccepted, setTermsAccepted] = useState(
    savedPayload.termsAccepted,
  );
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const clientErrors = useMemo(
    () =>
      getValidationErrors({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      }),
    [normalizedEmail, normalizedUsername, password],
  );
  const fieldErrors = {
    username: clientErrors.username ?? availabilityErrors.username,
    email: clientErrors.email ?? availabilityErrors.email,
    password: clientErrors.password,
  };
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stepOne = JSON.parse(
      localStorage.getItem(REGISTER_STEP_ONE_KEY) ?? "{}",
    );
    const validationErrors = getValidationErrors({
      username: normalizedUsername,
      email: normalizedEmail,
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
          username: "Este nome de usuário já esta em uso.",
        }));
        return;
      }

      if (!availability.emailAvailable) {
        setAvailabilityErrors((currentErrors) => ({
          ...currentErrors,
          email: "Este e-mail já esta sendo usado.",
        }));
        return;
      }

      const payload = {
        ...stepOne,
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        birthDate: `${birthYear}-${birthMonth}-${birthDay.padStart(2, "0")}`,
        country,
        state,
        city,
        source,
        termsAccepted,
      };

      localStorage.setItem(REGISTER_PAYLOAD_KEY, JSON.stringify(payload));

      setRegisterStep("/register/how-you-are");
      router.push("/register/how-you-are");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel validar seus dados. Tente novamente.",
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
            : "Este nome de usuario ja esta em uso.",
          email: availability.emailAvailable
            ? undefined
            : "Este e-mail ja esta sendo usado.",
        }));
      } catch (availabilityError) {
        if (availabilityError instanceof DOMException) {
          return;
        }

        setError("Nao foi possivel validar usuario e e-mail agora.");
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

  const isCurrentAvailabilityCheck =
    availabilityCheck?.username === normalizedUsername &&
    availabilityCheck?.email === normalizedEmail;
  const accountIsAvailable =
    isCurrentAvailabilityCheck &&
    availabilityCheck.usernameAvailable === true &&
    availabilityCheck.emailAvailable === true;
  const allRequiredFieldsFilled = Boolean(
    normalizedUsername &&
    normalizedEmail &&
    password &&
    birthDay &&
    birthMonth &&
    birthYear &&
    country &&
    state &&
    city &&
    source &&
    termsAccepted,
  );
  const canContinue =
    allRequiredFieldsFilled &&
    accountIsAvailable &&
    !hasFieldErrors &&
    !isCheckingAvailability &&
    !isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-4 py-3 lg:py-2">
      <div className="w-full max-w-230 bg-surface px-4 py-3 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6 lg:px-8">
        <div className="lg:col-span-2">
          <RegisterStepDots currentStep="/register/basic-info" />
        </div>
        <form
          className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4 mt-5"
          onSubmit={handleSubmit}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="space-y-2 lg:col-start-1 lg:row-start-2">
              <h1 className="text-2xl font-bold text-black-jewel">
                Crie sua conta
              </h1>

              <Label htmlFor="username" className="font-bold text-black-jewel">
                Nome de Usuário
              </Label>
              <p className="flex items-center gap-1 text-xs text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]">
                Use letras, números, ponto, hífen ou sublinhado, sem espaços.
              </p>

              <div className="relative border-b border-silver bg-[color-mix(in_srgb,var(--gold-soft)_30%,white)]">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
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
                    }
                  }}
                  onChange={(event) => {
                    setUsername(sanitizeUsername(event.target.value));
                    setError("");
                    setAvailabilityCheck(null);
                    setAvailabilityErrors((currentErrors) => ({
                      ...currentErrors,
                      username: undefined,
                    }));
                  }}
                  placeholder="Escolha um nome para seu perfil"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>

              <FieldMessage message={fieldErrors.username} />
            </div>

            <div className="space-y-2 lg:col-start-1 lg:row-start-3">
              <Label htmlFor="email" className="font-bold text-[var(--black)]">
                E-mail
              </Label>

              <p className="flex items-center gap-1 text-xs text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]">
                <Lock className="h-3 w-3" />
                Não ficará visível para outros usuários
              </p>
              <div className="relative border-b border-[var(--silver)] bg-[color:color-mix(in_srgb,var(--gold-soft)_30%,white)]">
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
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <FieldMessage message={fieldErrors.email} />
            </div>

            <div className="space-y-2 lg:col-start-1 lg:row-start-4">
              <Label
                htmlFor="password"
                className="font-bold text-[var(--black)]"
              >
                Senha
              </Label>

              <div className="relative border-b border-[var(--silver)] bg-[color:color-mix(in_srgb,var(--gold-soft)_30%,white)]">
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
                  className="h-11 border-0 bg-transparent pr-11 shadow-none focus-visible:ring-0"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-0 top-0 h-11 w-11 rounded-none text-[var(--black)] hover:bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-[color-mix(in_srgb,var(--black)_58%,transparent)]">
                Mínimo 8 caracteres, com letra maiúscula, minúscula, número e
                caractere especial.
              </p>

              <FieldMessage message={fieldErrors.password} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="space-y-3 lg:col-start-2 lg:row-start-2">
              <p className="text-sm font-bold text-black-jewel">
                Data de nascimento
              </p>

              <div className="grid grid-cols-3 gap-4">
                <Select value={birthDay} onValueChange={setBirthDay} required>
                  <SelectTrigger className="rounded-none w-full border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
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
            <div className="space-y-2 lg:col-start-2 lg:row-start-3">
              <Label className="font-bold text-[var(--black)]">País</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brasil">Brasil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-start-2 lg:row-start-4">
              <Label className="font-bold text-[var(--black)]">Estado</Label>
              <Select value={state} onValueChange={handleStateChange} required>
                <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((uf) => (
                    <SelectItem key={uf.id} value={uf.sigla}>
                      {uf.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-start-2 lg:row-start-5">
              <Label className="font-bold text-[var(--black)]">Cidade</Label>
              <Select
                value={city}
                onValueChange={setCity}
                required
                disabled={!state}
              >
                <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-start-2 lg:row-start-6">
              <Label className="font-bold text-[var(--black)]">
                Onde ouviu sobre a SugarMimo?
              </Label>
              <Select value={source} onValueChange={setSource} required>
                <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3 lg:col-start-2 lg:row-start-7">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                required
                className="mt-0.5"
              />

              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed text-[var(--black)]"
              >
                Li e aceito os{" "}
                <Link
                  href="/terms"
                  className="font-bold underline decoration-[var(--gold)] underline-offset-2"
                >
                  Termos de uso
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacy"
                  className="font-bold underline decoration-[var(--gold)] underline-offset-2"
                >
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            <StatusMessage
              error={error}
              isCheckingAvailability={isCheckingAvailability}
            />

            <Button
              type="submit"
              disabled={!canContinue}
              className="h-10 w-full rounded-md bg-emerald text-base font-bold text-white hover:bg-emerald/80 hover:text-white lg:col-start-2"
            >
              {isSubmitting ? "Validando..." : "Continuar Cadastro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldMessage({ message }: { message?: string }) {
  return (
    <p
      aria-live="polite"
      className={[
        "min-h-8 text-xs font-bold leading-4",
        message ? "text-ruby" : "text-transparent",
      ].join(" ")}
    >
      {message ?? "\u00a0"}
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
    error || (isCheckingAvailability ? "Validando usuario e e-mail..." : "");

  return (
    <p
      aria-live="polite"
      className={[
        "min-h-12 rounded-sm px-3 py-2 text-sm font-bold",
        error
          ? "bg-[color-mix(in_srgb,var(--ruby)_12%,white)] text-ruby"
          : message
            ? "bg-transparent text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]"
            : "bg-transparent text-transparent",
      ].join(" ")}
    >
      {message || "\u00a0"}
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
    throw new Error("Nao foi possivel validar seus dados. Tente novamente.");
  }

  return availability;
}

function getValidationErrors({
  username,
  email,
  password,
  showRequired = false,
}: {
  username: string;
  email: string;
  password: string;
  showRequired?: boolean;
}) {
  const errors: FieldErrors = {};

  if (showRequired && !username) {
    errors.username = "Informe um nome de usuario.";
  } else if (username && username.length < 2) {
    errors.username = "O nome de usuario deve ter pelo menos 2 caracteres.";
  } else if (username.length > 50) {
    errors.username = "O nome de usuario deve ter no maximo 50 caracteres.";
  } else if (username && !/^[A-Za-z0-9._-]+$/.test(username)) {
    errors.username =
      "Use apenas letras, numeros, ponto, hifen ou sublinhado, sem espacos.";
  }

  if (showRequired && !email) {
    errors.email = "Informe um e-mail.";
  } else if (email && !isValidEmail(email)) {
    errors.email = "Informe um e-mail valido.";
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
  return value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 50);
}

function getPasswordError(password: string, showRequired = false) {
  if (!password) {
    return showRequired ? "Informe uma senha." : undefined;
  }

  if (password.length < 8) {
    return "A senha deve ter no minimo 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra maiuscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra minuscula.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve ter pelo menos um numero.";
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
      password: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      country: "brasil",
      state: "",
      city: "",
      source: "",
      termsAccepted: false,
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
    password: String(payload.password ?? ""),
    birthDay,
    birthMonth,
    birthYear,
    country: String(payload.country ?? "brasil"),
    state: String(payload.state ?? ""),
    city: String(payload.city ?? ""),
    source: String(payload.source ?? ""),
    termsAccepted: payload.termsAccepted === true,
  };
}
