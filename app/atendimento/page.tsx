import type { Metadata } from "next";

import WhatsappBubble from "@/components/whatsapp-bubble";

import { HomeSupportSection } from "../components/HomeSupportSection";
import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";

export const metadata: Metadata = {
  title: "Atendimento | SugarMimo",
  description:
    "Canais de atendimento, reclamações, cancelamentos e consulta de protocolos da SugarMimo.",
  alternates: { canonical: "/atendimento" },
  openGraph: {
    title: "Atendimento | SugarMimo",
    description:
      "Canais de atendimento, reclamações, cancelamentos e consulta de protocolos da SugarMimo.",
    url: "/atendimento",
  },
};

export default function AtendimentoPage() {
  return (
    <main className="premium-page-shell">
      <NavBarMenu />
      <div className="pt-20">
        <HomeSupportSection />
      </div>
      <SiteFooter />
      <WhatsappBubble />
    </main>
  );
}
