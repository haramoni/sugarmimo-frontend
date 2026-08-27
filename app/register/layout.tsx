import type { ReactNode } from "react";

import { RegistrationSecretProvider } from "./RegistrationSecretProvider";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <RegistrationSecretProvider>{children}</RegistrationSecretProvider>;
}
