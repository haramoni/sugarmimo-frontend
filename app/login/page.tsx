import { LoginForm } from "./LoginForm";

export default function Login() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_80%_10%,color-mix(in_srgb,var(--gold-soft)_38%,transparent),transparent_30%),linear-gradient(135deg,var(--surface)_0%,var(--background)_48%,color-mix(in_srgb,var(--platinum)_60%,white)_100%)] text-[var(--black)]">
      <LoginForm />
    </main>
  );
}
