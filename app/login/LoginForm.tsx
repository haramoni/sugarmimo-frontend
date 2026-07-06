"use client";

import { type FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { ModalForgotPassword } from "./ModalForgotPassword";
import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

export function LoginForm() {
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = String(result?.message ?? "");

        if (message.toLowerCase().includes("pending")) {
          throw new Error("Seu perfil ainda está em análise.");
        }

        if (response.status >= 500) {
          throw new Error(
            message || "Nao foi possivel conectar ao servidor agora.",
          );
        }

        throw new Error("Usuário, e-mail ou senha inválidos.");
      }

      if (!result?.user) {
        throw new Error("Resposta de login inválida.");
      }

      localStorage.setItem("sugarmimo:user", JSON.stringify(result.user));
      window.dispatchEvent(new Event("sugarmimo-auth"));
      if (shouldShowPendingApproval(result.user)) {
        router.replace(PENDING_APPROVAL_ROUTE);
        return;
      }

      router.push("/perfil");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-vanilla/20 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2">
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={300}
            height={100}
            priority
            style={{ height: "auto" }}
          />
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário ou e-mail</Label>
              <Input
                id="username"
                name="identifier"
                type="text"
                required
                placeholder="Digite seu nome de usuário ou e-mail"
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
              className="bg-emerald w-full rounded-md"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="flex flex-row items-center justify-between">
            <ModalForgotPassword />
            <Link
              href="/register"
              className="flex w-fit items-center gap-3 rounded-md mt-3 underline hover:text-gold font-semibold text-gold"
            >
              <span>Cadastre-se agora!</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
