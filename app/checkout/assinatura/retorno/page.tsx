import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/ui/SiteFooter";
import NavBarMenu from "@/app/components/ui/NavBarMenu";
import { PlansAccessGuard } from "@/app/planos/plans-access-guard";

import { PaymentReturnStatus } from "./payment-return-status";

export const metadata: Metadata = {
  title: "Confirmação do pagamento | SugarMimo",
  robots: { index: false, follow: false },
};

export default function MembershipPaymentReturnPage() {
  return (
    <PlansAccessGuard>
      <main className="min-h-screen bg-[#070706] text-[#f7f0e5]">
        <NavBarMenu />
        <PaymentReturnStatus />
        <SiteFooter />
      </main>
    </PlansAccessGuard>
  );
}
