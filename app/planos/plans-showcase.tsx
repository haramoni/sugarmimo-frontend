"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Barcode,
  Check,
  CreditCard,
  Crown,
  Gem,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import styles from "./plans.module.css";

type BillingCycle = "monthly" | "quarterly" | "semiannual";
type PlanId = "member" | "premium" | "elite";

type Price = {
  total: string;
  suffix: string;
  monthlyEquivalent: string;
  saving?: string;
};

type Plan = {
  id: PlanId;
  name: string;
  eyebrow: string;
  description: string;
  icon: typeof BadgeCheck;
  benefits: string[];
  prices: Record<BillingCycle, Price>;
};

const billingCycles: Array<{
  id: BillingCycle;
  label: string;
  shortLabel: string;
}> = [
  { id: "monthly", label: "Mensal", shortLabel: "1 mês" },
  { id: "quarterly", label: "Trimestral", shortLabel: "3 meses" },
  { id: "semiannual", label: "Semestral", shortLabel: "6 meses" },
];

const plans: Plan[] = [
  {
    id: "member",
    name: "Básico",
    eyebrow: "Presença reconhecida",
    description:
      "Entre para o clube com uma identificação exclusiva no seu perfil.",
    icon: BadgeCheck,
    benefits: ["Badge Membro exclusivo"],
    prices: {
      monthly: {
        total: "199",
        suffix: "/ 1 mês",
        monthlyEquivalent: "R$ 199/mês",
      },
      quarterly: {
        total: "499",
        suffix: "/ 3 meses",
        monthlyEquivalent: "R$ 166/mês",
        saving: "Economize R$ 98",
      },
      semiannual: {
        total: "899",
        suffix: "/ 6 meses",
        monthlyEquivalent: "R$ 150/mês",
        saving: "Economize R$ 295 🔥",
      },
    },
  },
  {
    id: "premium",
    name: "Premium",
    eyebrow: "Destaque dourado",
    description:
      "Valorize cada aparição com uma assinatura visual dourada e marcante.",
    icon: Crown,
    benefits: ["Badge Premium dourado", "Borda dourada no perfil"],
    prices: {
      monthly: {
        total: "299",
        suffix: "/ 1 mês",
        monthlyEquivalent: "R$ 299/mês",
      },
      quarterly: {
        total: "749",
        suffix: "/ 3 meses",
        monthlyEquivalent: "R$ 250/mês",
        saving: "Economize R$ 148",
      },
      semiannual: {
        total: "1.349",
        suffix: "/ 6 meses",
        monthlyEquivalent: "R$ 225/mês",
        saving: "Economize R$ 445 🔥",
      },
    },
  },
  {
    id: "elite",
    name: "Elite",
    eyebrow: "Experiência exclusiva",
    description:
      "O máximo de distinção, com brilho de diamante e moldura exclusiva.",
    icon: Gem,
    benefits: [
      "Badge Elite diamante",
      "Borda diamante no perfil",
      "Moldura de destaque",
    ],
    prices: {
      monthly: {
        total: "849",
        suffix: "/ 1 mês",
        monthlyEquivalent: "R$ 849/mês",
      },
      quarterly: {
        total: "2.149",
        suffix: "/ 3 meses",
        monthlyEquivalent: "R$ 716/mês",
        saving: "Economize R$ 398",
      },
      semiannual: {
        total: "3.799",
        suffix: "/ 6 meses",
        monthlyEquivalent: "R$ 633/mês",
        saving: "Economize R$ 1.295 🔥",
      },
    },
  },
];

export function PlansShowcase() {
  const [selectedChoice, setSelectedChoice] = useState<{
    plan: PlanId;
    cycle: BillingCycle;
  } | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedChoice?.plan);
  const selectedCycle = billingCycles.find(
    (cycle) => cycle.id === selectedChoice?.cycle,
  );

  return (
    <div className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="plans-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.kicker}>
            <span />
            <Sparkles aria-hidden="true" />
            Clube SugarMimo
            <span />
          </div>

          <h1 id="plans-title">
            Planos de <em>assinatura</em>
          </h1>
          <p className={styles.heroText}>
            Compare todos os valores, escolha seu nível de destaque e selecione
            o período ideal para você.
          </p>
        </div>
      </section>

      <section
        className={styles.pricingSection}
        aria-labelledby="pricing-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p>Escolha sua experiência</p>
            <h2 id="pricing-title">Todos os planos. Todos os períodos.</h2>
          </div>
          <span>
            <ShieldCheck aria-hidden="true" />
            Revise antes da compra
          </span>
        </div>

        <div className={styles.mobilePlans} aria-label="Planos disponíveis">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <article
                key={plan.id}
                className={`${styles.mobilePlanCard} ${styles[plan.id]}`}
              >
                <div className={styles.mobilePlanGlow} aria-hidden="true" />
                <header className={styles.mobilePlanHeader}>
                  <span className={styles.planIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <small>{plan.eyebrow}</small>
                    <h3>{plan.name}</h3>
                  </div>
                  {plan.id === "premium" ? (
                    <span className={styles.mobilePopular}>
                      <Star aria-hidden="true" /> Mais escolhido
                    </span>
                  ) : null}
                </header>

                <p className={styles.mobilePlanDescription}>
                  {plan.description}
                </p>

                <div className={styles.mobilePriceList}>
                  {billingCycles.map((cycle) => {
                    const price = plan.prices[cycle.id];
                    const isSelected =
                      selectedChoice?.plan === plan.id &&
                      selectedChoice.cycle === cycle.id;

                    return (
                      <button
                        key={`${plan.id}-${cycle.id}-mobile`}
                        type="button"
                        aria-pressed={isSelected}
                        className={`${styles.mobilePriceOption} ${
                          cycle.id === "semiannual"
                            ? styles.mobileRecommended
                            : ""
                        } ${isSelected ? styles.mobileSelected : ""}`}
                        aria-label={`Escolher plano ${plan.name} ${cycle.label.toLowerCase()} por R$ ${price.total}`}
                        data-checkout-href={`/checkout/assinatura?plano=${plan.id}&periodo=${cycle.id}`}
                        onClick={() =>
                          setSelectedChoice({ plan: plan.id, cycle: cycle.id })
                        }
                      >
                        <span className={styles.mobileCycle}>
                          {cycle.id === "semiannual" ? (
                            <small className={styles.mobileBestLabel}>
                              Melhor🔥
                            </small>
                          ) : null}
                          <strong>{cycle.label}</strong>
                          <small>{cycle.shortLabel}</small>
                        </span>

                        <span className={styles.mobilePrice}>
                          <span>
                            <small>R$</small>
                            <strong>{price.total}</strong>
                          </span>
                          <small>{price.monthlyEquivalent}</small>
                        </span>

                        <span
                          className={styles.mobileSelectIcon}
                          aria-hidden="true"
                        >
                          {isSelected ? <Check /> : <ArrowUpRight />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.pricingViewport}>
          <div
            className={styles.pricingTable}
            role="table"
            aria-label="Valores dos planos"
          >
            <div className={styles.tableRow} role="row">
              <div className={styles.periodHeader} role="columnheader">
                <small>Escolha o</small>
                <strong>Período</strong>
              </div>

              {plans.map((plan) => {
                const Icon = plan.icon;

                return (
                  <div
                    key={plan.id}
                    role="columnheader"
                    className={`${styles.planHeader} ${styles[plan.id]}`}
                  >
                    {plan.id === "premium" ? (
                      <span className={styles.popularFlag}>
                        <Star aria-hidden="true" /> Mais escolhido
                      </span>
                    ) : null}
                    <span className={styles.planIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <small>{plan.eyebrow}</small>
                      <strong>{plan.name}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {billingCycles.map((cycle) => (
              <div
                key={cycle.id}
                className={`${styles.tableRow} ${
                  cycle.id === "semiannual" ? styles.recommendedRow : ""
                }`}
                role="row"
              >
                <div className={styles.periodCell} role="rowheader">
                  {cycle.id === "semiannual" ? (
                    <span className={styles.rowFlag}>VALOR 🔥</span>
                  ) : null}
                  <strong>{cycle.label}</strong>
                  <small>{cycle.shortLabel}</small>
                </div>

                {plans.map((plan) => {
                  const price = plan.prices[cycle.id];
                  const isSelected =
                    selectedChoice?.plan === plan.id &&
                    selectedChoice.cycle === cycle.id;

                  return (
                    <div
                      key={`${plan.id}-${cycle.id}`}
                      role="cell"
                      className={styles.priceCellWrapper}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        className={`${styles.priceCell} ${styles[plan.id]} ${
                          isSelected ? styles.selected : ""
                        }`}
                        aria-label={`Escolher plano ${plan.name} ${cycle.label.toLowerCase()} por R$ ${price.total}`}
                        data-checkout-href={`/checkout/assinatura?plano=${plan.id}&periodo=${cycle.id}`}
                        onClick={() =>
                          setSelectedChoice({ plan: plan.id, cycle: cycle.id })
                        }
                      >
                        <span className={styles.savingLabel}>
                          {price.saving ?? "Plano mensal"}
                        </span>
                        <span className={styles.priceMain}>
                          <small>R$</small>
                          <strong>{price.total}</strong>
                        </span>
                        <span className={styles.priceSuffix}>
                          {price.suffix}
                        </span>
                        <span className={styles.priceEquivalent}>
                          {price.monthlyEquivalent}
                        </span>
                        <span className={styles.selectLabel}>
                          {isSelected ? (
                            <>
                              <Check aria-hidden="true" /> Selecionado
                            </>
                          ) : (
                            <>
                              Selecionar <ArrowUpRight aria-hidden="true" />
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${styles.checkoutNote} ${
            selectedPlan && selectedCycle ? styles.checkoutReady : ""
          }`}
          aria-live="polite"
        >
          {selectedPlan && selectedCycle ? (
            <div className={styles.checkoutAction}>
              <div className={styles.checkoutSummary}>
                <span className={styles.checkoutCheck} aria-hidden="true">
                  <Check />
                </span>
                <span>
                  <small>Sua escolha</small>
                  <strong>
                    Plano {selectedPlan.name} · {selectedCycle.label}
                  </strong>
                </span>
                <b>R$ {selectedPlan.prices[selectedCycle.id].total}</b>
              </div>

              <Link
                className={styles.checkoutButton}
                href={`/checkout/assinatura?plano=${selectedPlan.id}&periodo=${selectedCycle.id}`}
              >
                <span>
                  <small>Ir para o pagamento</small>
                  ASSINAR AGORA
                </span>
                <ArrowUpRight aria-hidden="true" />
              </Link>

              <div className={styles.paymentMethods}>
                <span>
                  <CreditCard aria-hidden="true" /> Cartão de crédito
                </span>
                <span>
                  <Barcode aria-hidden="true" /> Boleto
                </span>
                <span>
                  <QrCode aria-hidden="true" /> Pix
                </span>
                <span className={styles.secureCheckout}>
                  <LockKeyhole aria-hidden="true" /> Ambiente seguro
                </span>
              </div>
            </div>
          ) : (
            <>
              <Sparkles aria-hidden="true" />
              <span>
                Clique em qualquer valor para selecionar sua assinatura.
              </span>
            </>
          )}
        </div>

        <p className={styles.scrollHint}>
          Deslize para o lado para comparar todos os planos
        </p>
      </section>

      <section
        className={styles.benefitsSection}
        aria-labelledby="benefits-title"
      >
        <div className={styles.benefitsHeading}>
          <p>Uma evolução visível</p>
          <h2 id="benefits-title">O destaque de cada perfil</h2>
          <span>
            Comece com o essencial ou escolha uma presença completamente
            personalizada.
          </span>
        </div>

        <div className={styles.benefitsGrid}>
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <article
                key={plan.id}
                className={`${styles.benefitCard} ${styles[plan.id]}`}
              >
                <header>
                  <span className={styles.planIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <small>Perfil {plan.name}</small>
                    <h3>{plan.name}</h3>
                  </div>
                </header>

                <ProfilePreview plan={plan.id} />
                <p className={styles.benefitDescription}>{plan.description}</p>

                <ul>
                  {plan.benefits.map((benefit) => (
                    <li key={benefit}>
                      <span>
                        <Check aria-hidden="true" />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProfilePreview({ plan }: { plan: PlanId }) {
  const planName =
    plan === "member" ? "Membro" : plan === "premium" ? "Premium" : "Elite";

  return (
    <div
      className={styles.profilePreview}
      aria-label={`Prévia visual do plano ${planName}`}
    >
      <div className={styles.previewFrame}>
        {plan === "elite" ? (
          <>
            <span className={styles.frameCornerTop} aria-hidden="true">
              ✦
            </span>
            <span className={styles.frameCornerBottom} aria-hidden="true">
              ✦
            </span>
          </>
        ) : null}
        <div className={styles.previewAvatar}>
          <span>SM</span>
        </div>
      </div>
      <div className={styles.previewIdentity}>
        <span>Seu nome</span>
        <small>São Paulo, SP</small>
      </div>
      <span className={styles.previewBadge}>
        {plan === "elite" ? (
          <Gem />
        ) : plan === "premium" ? (
          <Crown />
        ) : (
          <BadgeCheck />
        )}
        {planName}
      </span>
    </div>
  );
}
