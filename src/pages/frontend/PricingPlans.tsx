import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { useSubscriptionPlans } from "@/features/subscriptions/useSubscriptions";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

const PLAN_FEATURES = [
  "Full access to all study guides",
  "Unlimited flashcards",
  "Practice questions for all specialties",
  "Cancel anytime",
  "All future updates included",
] as const;

type PlanVariant = "side" | "featured";

type Plan = {
  variant: PlanVariant;
  name: string;
  amount: string;
  period: string;
  tagline?: string;
};

const PLANS: Plan[] = [
  {
    variant: "side",
    name: "Weekly",
    amount: "10",
    period: "Every week",
    tagline: "Perfect for short-term preparation",
  },
  {
    variant: "featured",
    name: "Monthly",
    amount: "30",
    period: "Every month",
  },
  {
    variant: "side",
    name: "Annual",
    amount: "249",
    period: "Every year",
    tagline: "Save 17% compared to monthly",
  },
];

function PriceDisplay({
  amount,
  inverted,
}: {
  amount: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-start gap-0.5 font-heading font-bold tracking-tight",
        inverted ? "text-white" : "text-black",
      )}
    >
      <span
        className={cn(
          "mt-1.5 align-top text-[0.95rem] font-bold leading-none sm:text-lg",
          inverted ? "text-white" : "text-black",
        )}
      >
        $
      </span>
      <span className="text-[2.75rem] leading-none sm:text-5xl">{amount}</span>
    </div>
  );
}

function matchApiPlanName(apiDuration: string, planName: string): boolean {
  const d = apiDuration.toLowerCase();
  const n = planName.toLowerCase();
  return d.includes(n) || n.includes(d);
}

export default function PricingPlans() {
  const { data: apiPlans = [] } = useSubscriptionPlans();

  const displayPlans = useMemo(() => {
    if (apiPlans.length === 0) return PLANS;
    return PLANS.map((plan) => {
      const match = apiPlans.find((p) => matchApiPlanName(p.duration, plan.name));
      if (!match) return plan;
      return {
        ...plan,
        amount: String(Math.round(match.price)),
      };
    });
  }, [apiPlans]);

  useEffect(() => {
    document.title = "Plans & Pricing | Sonographer Pal";
  }, []);

  return (
    <div className="bg-white">
      <section className="py-12 lg:py-16">
        <div className={cn(container)}>
          <h1 className="text-center font-heading text-[32px] font-bold leading-tight tracking-tight text-black sm:text-[40px]">
            Explore Our Pricing Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base font-normal leading-relaxed text-neutral-600 sm:text-lg">
            Choose the plan that works best for you. All plans include full access to our comprehensive study materials.
          </p>

          <ul className="mx-auto mt-10 grid max-w-6xl list-none grid-cols-1 gap-5 p-0 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {displayPlans.map((plan) => {
              const isFeatured = plan.variant === "featured";

              return (
                <li key={plan.name} className="flex">
                  <article
                    className={cn(
                      "flex w-full flex-col overflow-hidden rounded-lg border border-[#d1d5db] shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
                    )}
                  >
                    {/* Top: pricing header */}
                    <div
                      className={cn(
                        "flex flex-col px-6 pb-6 pt-8 sm:px-7 sm:pb-7 sm:pt-9",
                        isFeatured ? "bg-black text-white" : "bg-[#e8e8e8] text-black",
                      )}
                    >
                      <h2
                        className={cn(
                          "text-left font-heading text-xl font-bold sm:text-2xl",
                          isFeatured ? "text-white" : "text-black",
                        )}
                      >
                        {plan.name}
                      </h2>

                      <div className="mt-5">
                        <PriceDisplay amount={plan.amount} inverted={isFeatured} />
                      </div>

                      <p
                        className={cn(
                          "mt-2 text-left font-sans text-sm font-normal",
                          isFeatured ? "text-white/90" : "text-neutral-700",
                        )}
                      >
                        {plan.period}
                      </p>

                      {plan.tagline ? (
                        <p
                          className={cn(
                            "mt-3 text-left font-sans text-sm leading-snug",
                            isFeatured ? "text-white/85" : "text-neutral-700",
                          )}
                        >
                          {plan.tagline}
                        </p>
                      ) : null}

                      <div className="mt-6">
                        <Link
                          to={`/register?plan=${plan.name.toLowerCase()}`}
                          className={cn(
                            "inline-flex w-full items-center justify-center rounded-md py-2.5 font-sans text-sm font-semibold transition sm:text-base",
                            isFeatured
                              ? "bg-white text-black hover:bg-neutral-100"
                              : "bg-black text-white hover:bg-neutral-900",
                          )}
                        >
                          Get Started
                        </Link>
                      </div>
                    </div>

                    {/* Bottom: features */}
                    <div
                      className={cn(
                        "flex flex-1 flex-col border-t border-black/10 px-0 pb-2 pt-0",
                        isFeatured ? "bg-[#c9b896]" : "bg-[#f0f0f0]",
                      )}
                    >
                      <ul className="flex list-none flex-col p-0">
                        {PLAN_FEATURES.map((feature, idx) => (
                          <li
                            key={feature}
                            className={cn(
                              "flex gap-3 border-b border-black/10 px-5 py-3.5 font-sans text-sm leading-snug sm:px-6 sm:text-[15px]",
                              isFeatured ? "text-black" : "text-black",
                              idx === PLAN_FEATURES.length - 1 && "border-b-0",
                            )}
                          >
                            <Check
                              className={cn(
                                "mt-0.5 size-[18px] shrink-0",
                                isFeatured ? "text-black" : "text-black",
                              )}
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

    </div>
  );
}
