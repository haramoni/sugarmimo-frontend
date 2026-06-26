"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { ModalForgotPassword } from "./ModalForgotPassword";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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
          />
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário ou e-mail</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu username ou e-mail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
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

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
          <div className="flex flex-row items-center justify-between gap-2">
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
