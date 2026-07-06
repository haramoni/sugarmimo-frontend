"use client";

import { type FormEvent, useState } from "react";
import { ArrowBigLeft, Eye, EyeOff, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Login administrativo inválido.");
      }

      localStorage.setItem("sugarmimo:admin-token", result.accessToken);
      router.push("/admin/approvals");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login administrativo inválido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-4 py-10">
      <Card className="w-full max-w-sm rounded-sm border-0 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_22px_60px_rgba(20,17,14,0.24)] backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-3">
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={260}
            height={87}
            priority
            style={{ height: "auto" }}
          />
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--black)]">
            <Shield className="h-4 w-4 text-gold" />
            Acesso Administrativo
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuário ou e-mail</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                placeholder="Digite seu acesso administrativo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Digite sua senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p className="rounded-sm bg-[color:color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-[var(--ruby)]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-sm bg-[var(--black)] font-bold text-white hover:bg-[var(--gold)]"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-sm hover:bg-gold"
              onClick={handleBack}
            >
              <ArrowBigLeft /> Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
