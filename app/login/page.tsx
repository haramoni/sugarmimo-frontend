import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar | SugarMimo",
  description: "Acesse sua área privada de membro da SugarMimo.",
  robots: { index: false, follow: false },
};

export default function Login() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#f4ecdf]">
      <LoginForm />
    </main>
  );
}
