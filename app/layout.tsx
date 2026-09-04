import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "./components/AuthProvider";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { AgeConfirmationDialog } from "./components/AgeConfirmationDialog";
import { site } from "@/lib/site";
import { futura, hessGothic, zingRust } from "./fonts";

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
  metadataBase: new URL(site.url),
  title: {
    default: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
    template: "%s",
  },
  description: site.description,
  applicationName: site.name,
  category: "Relacionamentos",
  openGraph: {
    siteName: site.name,
    title: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
    description: site.description,
    url: site.url,
    type: "website",
    locale: site.locale,
    images: [
      {
        url: "/brand/hero-trio-hq-4k.webp",
        width: 3548,
        height: 1774,
        type: "image/webp",
        alt: "SugarMimo — Elegância, segurança e liberdade de escolha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SugarMimo | Relacionamento Sugar com Segurança e Privacidade",
    description: site.description,
    images: ["/brand/hero-trio-hq-4k.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={cn(
        "h-full antialiased font-sans",
        manrope.variable,
        playfair.variable,
        futura.variable,
        hessGothic.variable,
        zingRust.variable,
      )}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>{children}</AuthProvider>
        <AgeConfirmationDialog />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
