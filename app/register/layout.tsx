import type { ReactNode } from "react";

import { RegistrationSecretProvider } from "./RegistrationSecretProvider";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <RegistrationSecretProvider>
      <div className="registration-theme">{children}</div>
    </RegistrationSecretProvider>
  );
}
