"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";

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

type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

type IbgeCity = {
  id: number;
  nome: string;
};

export default function RegisterAccountForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("brasil");
  const [source, setSource] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const stepOne = JSON.parse(
      localStorage.getItem("sugarmimo:register-step-one") ?? "{}",
    );

    const payload = {
      ...stepOne,
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      birthDate: `${birthYear}-${birthMonth}-${birthDay.padStart(2, "0")}`,
      country,
      state,
      city,
      source,
      termsAccepted,
    };

    localStorage.setItem("sugarmimo:register-payload", JSON.stringify(payload));

    // Envie este payload para a API quando o endpoint estiver definido.
    console.log("SugarMimo register payload:", payload);
  }

  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
    )
      .then((res) => res.json())
      .then(setStates);
  }, []);

  useEffect(() => {
    if (!state) {
      setCities([]);
      setCity("");
      return;
    }

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`,
    )
      .then((res) => res.json())
      .then(setCities);

    setCity("");
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble-option-05.png')] bg-cover bg-center px-5 py-10">
      <div className="w-full max-w-[500px] bg-[var(--surface)] px-4 py-6 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2 border-b border-[var(--silver)] pb-4">
            <h1 className="text-2xl font-bold text-[var(--black)]">
              Crie sua conta
            </h1>

            <Label htmlFor="username" className="font-bold text-[var(--black)]">
              Nome de Usuário
            </Label>

            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Escolha um nome para seu perfil"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />

            <p className="text-sm text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]">
              O nome escolhido não podera ser alterado depois.
            </p>
          </div>

          <div className="space-y-2 border-b border-[var(--silver)] pb-4">
            <Label htmlFor="email" className="font-bold text-[var(--black)]">
              E-mail
            </Label>

            <p className="flex items-center gap-1 text-xs text-[color:color-mix(in_srgb,var(--black)_58%,transparent)]">
              <Lock className="h-3 w-3" />
              Não ficara visivel para outros usuarios
            </p>

            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Ex.: nome@email.com.br"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-[var(--black)]">
              Senha
            </Label>

            <div className="relative border-b border-[var(--silver)] bg-[color:color-mix(in_srgb,var(--gold-soft)_30%,white)]">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
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
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-[var(--black)]">
              Data de nascimento
            </p>

            <div className="grid grid-cols-3 gap-6">
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

              <Select value={birthMonth} onValueChange={setBirthMonth} required>
                <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Janeiro</SelectItem>
                  <SelectItem value="02">Fevereiro</SelectItem>
                  <SelectItem value="03">Marco</SelectItem>
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

          <div className="space-y-2">
            <Label className="font-bold text-[var(--black)]">Pais</Label>
            <Select value={country} onValueChange={setCountry} required>
              <SelectTrigger className="w-full rounded-none border-0 border-b border-[var(--silver)] bg-transparent px-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brasil">Brasil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-[var(--black)]">Estado</Label>
            <Select value={state} onValueChange={setState} required>
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

          <div className="space-y-2">
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

          <div className="space-y-2">
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

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
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
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link
                href="/privacy"
                className="font-bold underline decoration-[var(--gold)] underline-offset-2"
              >
                Politicas de Privacidade
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-sm bg-[var(--gold)] text-base font-bold text-[var(--black)] hover:bg-[color:color-mix(in_srgb,var(--gold)_84%,var(--black))] hover:text-[var(--surface)]"
          >
            Continuar cadastro
          </Button>
        </form>
      </div>
    </div>
  );
}
