import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "./components/AuthProvider";
import { CookieConsentBanner } from "./components/CookieConsentBanner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sugarmimo.com",
  ),
  title: {
    default: "SugarMimo | Relacionamentos requintados",
    template: "%s",
  },
  description:
    "Conexões entre adultos com transparência, respeito e experiências especiais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "h-full antialiased font-sans",
        manrope.variable,
        playfair.variable,
      )}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>{children}</AuthProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
