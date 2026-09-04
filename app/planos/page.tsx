import type { Metadata } from "next";

import { SiteFooter } from "../components/ui/SiteFooter";
import NavBarMenu from "../components/ui/NavBarMenu";
import { PlansAccessGuard } from "./plans-access-guard";
import { PlansShowcase } from "./plans-showcase";

export const metadata: Metadata = {
  title: "Planos | SugarMimo",
  description:
    "Conheça os planos Básico, Premium e Elite da SugarMimo e escolha a experiência ideal para o seu perfil.",
};

export default function PlanosPage() {
  return (
    <PlansAccessGuard>
      <main className="min-h-screen bg-[#070706] text-[#f7f0e5]">
        <NavBarMenu />
        <PlansShowcase />
        <SiteFooter />
      </main>
    </PlansAccessGuard>
  );
}
