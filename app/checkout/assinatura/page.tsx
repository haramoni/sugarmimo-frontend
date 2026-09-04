import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlansAccessGuard } from "@/app/planos/plans-access-guard";
import { SiteFooter } from "@/app/components/ui/SiteFooter";
import NavBarMenu from "@/app/components/ui/NavBarMenu";

import { PaymentOptions } from "./payment-options";

export const metadata: Metadata = {
  title: "Pagamento da assinatura | SugarMimo",
  description: "Revise sua assinatura e escolha a forma de pagamento.",
};

type PlanId = "member" | "premium" | "elite";
type BillingCycle = "monthly" | "quarterly" | "semiannual";

const checkoutPlans: Record<
  PlanId,
  {
    name: string;
    prices: Record<
      BillingCycle,
      { total: string; cycle: string; monthlyEquivalent: string }
    >;
  }
> = {
  member: {
    name: "Básico",
    prices: {
      monthly: {
        total: "199",
        cycle: "Mensal · 1 mês",
        monthlyEquivalent: "R$ 199/mês",
      },
      quarterly: {
        total: "499",
        cycle: "Trimestral · 3 meses",
        monthlyEquivalent: "R$ 166/mês",
      },
      semiannual: {
        total: "899",
        cycle: "Semestral · 6 meses",
        monthlyEquivalent: "R$ 150/mês",
      },
    },
  },
  premium: {
    name: "Premium",
    prices: {
      monthly: {
        total: "299",
        cycle: "Mensal · 1 mês",
        monthlyEquivalent: "R$ 299/mês",
      },
      quarterly: {
        total: "749",
        cycle: "Trimestral · 3 meses",
        monthlyEquivalent: "R$ 250/mês",
      },
      semiannual: {
        total: "1.349",
        cycle: "Semestral · 6 meses",
        monthlyEquivalent: "R$ 225/mês",
      },
    },
  },
  elite: {
    name: "Elite",
    prices: {
      monthly: {
        total: "849",
        cycle: "Mensal · 1 mês",
        monthlyEquivalent: "R$ 849/mês",
      },
      quarterly: {
        total: "2.149",
        cycle: "Trimestral · 3 meses",
        monthlyEquivalent: "R$ 716/mês",
      },
      semiannual: {
        total: "3.799",
        cycle: "Semestral · 6 meses",
        monthlyEquivalent: "R$ 633/mês",
      },
    },
  },
};

export default async function SubscriptionCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    plano?: string | string[];
    periodo?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const planId = singleValue(query.plano);
  const cycleId = singleValue(query.periodo);

  if (!isPlanId(planId) || !isBillingCycle(cycleId)) {
    redirect("/planos");
  }

  const plan = checkoutPlans[planId];
  const price = plan.prices[cycleId];

  return (
    <PlansAccessGuard>
      <main className="min-h-screen bg-[#070706] text-[#f7f0e5]">
        <NavBarMenu />
        <PaymentOptions
          planId={planId}
          cycleId={cycleId}
          planName={plan.name}
          cycle={price.cycle}
          total={price.total}
          monthlyEquivalent={price.monthlyEquivalent}
        />
        <SiteFooter />
      </main>
    </PlansAccessGuard>
  );
}

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPlanId(value: string | undefined): value is PlanId {
  return value === "member" || value === "premium" || value === "elite";
}

function isBillingCycle(value: string | undefined): value is BillingCycle {
  return (
    value === "monthly" || value === "quarterly" || value === "semiannual"
  );
}
