import type { Metadata } from "next";

import AfiliadasClient from "./afiliadas-client";

export const metadata: Metadata = {
  title: "Programa de Afiliadas | SugarMimo",
  description:
    "Área exclusiva para Sugar Babies compartilharem seu link de convite SugarMimo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AfiliadasPage() {
  return <AfiliadasClient />;
}
