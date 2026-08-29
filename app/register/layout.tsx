import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RegistrationSecretProvider } from "./RegistrationSecretProvider";

export const metadata: Metadata = {
  title: "Criar perfil | SugarMimo",
  description:
    "Crie seu perfil privado na SugarMimo e informe suas preferências com segurança.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <RegistrationSecretProvider>
      <div className="registration-theme">{children}</div>
    </RegistrationSecretProvider>
  );
}
