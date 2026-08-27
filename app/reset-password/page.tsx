import type { Metadata } from "next";

import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Redefinir senha | SugarMimo",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_80%_10%,color-mix(in_srgb,var(--gold-soft)_38%,transparent),transparent_30%),linear-gradient(135deg,var(--surface)_0%,var(--background)_48%,color-mix(in_srgb,var(--platinum)_60%,white)_100%)]">
      <ResetPasswordForm />
    </main>
  );
}
