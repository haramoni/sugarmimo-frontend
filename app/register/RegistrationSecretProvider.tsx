"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { scrubPersistedRegistrationSecrets } from "./register-flow";

type RegistrationSecretContextValue = {
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  clearPassword: () => void;
};

const RegistrationSecretContext =
  createContext<RegistrationSecretContextValue | null>(null);

export function RegistrationSecretProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [password, setPassword] = useState("");
  const clearPassword = useCallback(() => setPassword(""), []);

  useEffect(() => {
    scrubPersistedRegistrationSecrets();
  }, []);

  const value = useMemo(
    () => ({ password, setPassword, clearPassword }),
    [clearPassword, password],
  );

  return (
    <RegistrationSecretContext.Provider value={value}>
      {children}
    </RegistrationSecretContext.Provider>
  );
}

export function useRegistrationSecret() {
  const context = useContext(RegistrationSecretContext);

  if (!context) {
    throw new Error(
      "useRegistrationSecret deve ser usado dentro de RegistrationSecretProvider.",
    );
  }

  return context;
}
