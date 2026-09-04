import type { Metadata } from "next";

import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Redefinir senha | SugarMimo",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="premium-page-shell">
      <ResetPasswordForm />
    </main>
  );
}
