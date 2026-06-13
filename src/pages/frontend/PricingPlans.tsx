import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/auth/useAuth";
import type { SubscriptionPlan } from "@/features/subscriptions/subscriptionsApi";
import {
  billingPeriodLabel,
  cardVariant,
  isFeaturedPlan,
  planRegisterSlug,
  pricingGridClass,
} from "@/features/subscriptions/planPresentation";
import {
  useCreateCheckout,
  usePublicSubscriptionPlans,
  useSubscriptionCheck,
} from "@/features/subscriptions/useSubscriptions";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

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

const planButtonClass = (isFeatured: boolean) =>
  cn(
    "inline-flex w-full items-center justify-center rounded-md py-2.5 font-sans text-sm font-semibold transition sm:text-base disabled:cursor-not-allowed disabled:opacity-60",
    isFeatured
      ? "bg-white text-black hover:bg-neutral-100"
      : "bg-black text-white hover:bg-neutral-900",
  );

function PlanActionButton({
  plan,
  isFeatured,
  isPlansLoading,
}: {
  plan: SubscriptionPlan;
  isFeatured: boolean;
  isPlansLoading: boolean;
}) {
  const { isAuthenticated, isSessionLoading, isUserLoading } = useAuth();
  const { data: isPremium } = useSubscriptionCheck({ enabled: isAuthenticated });
  const checkoutMutation = useCreateCheckout();
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  const authReady = !isSessionLoading && !isUserLoading;
  const isPremiumUser = isPremium === true;
  const isLoading = checkoutMutation.isPending && pendingPlanId === plan.id;

  async function handleCheckout() {
    setPendingPlanId(plan.id);
    try {
      await checkoutMutation.mutateAsync(plan.id);
    } catch {
      toast.error("Unable to start checkout. Please try again.");
      setPendingPlanId(null);
    }
  }

  if (!authReady || isPlansLoading) {
    return (
      <button type="button" disabled className={planButtonClass(isFeatured)}>
        Loading…
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        to={`/register?plan=${planRegisterSlug(plan.duration)}`}
        className={planButtonClass(isFeatured)}
      >
        Get Started
      </Link>
    );
  }

  if (isPremiumUser) {
    return (
      <Link to="/account/my-subscriptions" className={planButtonClass(isFeatured)}>
        Manage Subscription
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => void handleCheckout()}
      className={planButtonClass(isFeatured)}
    >
      {isLoading ? "Redirecting…" : "Subscribe Now"}
    </button>
  );
}

export default function PricingPlans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError,
    refetch,
  } = usePublicSubscriptionPlans();

  useEffect(() => {
    document.title = "Plans & Pricing | Sonographer Pal";
  }, []);

  useEffect(() => {
    if (searchParams.get("checkout") !== "cancelled") return;
    toast.error("Checkout was cancelled.");
    searchParams.delete("checkout");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

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

          {isPlansLoading ? (
            <p className="mt-10 text-center font-sans text-base text-neutral-500">Loading plans…</p>
          ) : isError ? (
            <div className="mt-10 text-center">
              <p className="font-sans text-base text-neutral-600">
                Unable to load pricing plans right now.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-black px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-neutral-900"
              >
                Try again
              </button>
            </div>
          ) : plans.length === 0 ? (
            <p className="mt-10 text-center font-sans text-base text-neutral-500">
              No subscription plans are available at the moment.
            </p>
          ) : (
            <ul
              className={cn(
                "mx-auto mt-10 grid max-w-6xl list-none gap-5 p-0 sm:mt-12 lg:mt-14 lg:gap-6",
                pricingGridClass(plans.length),
              )}
            >
              {plans.map((plan) => {
                const featured = isFeaturedPlan(plan);
                const variant = cardVariant(featured);
                const isFeatured = variant === "featured";
                const features = plan.features ?? [];

                return (
                  <li key={plan.id} className="flex">
                    <article className="flex w-full flex-col overflow-hidden rounded-lg border border-[#d1d5db] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      <div
                        className={cn(
                          "flex flex-col px-6 pb-6 pt-8 sm:px-7 sm:pb-7 sm:pt-9",
                          isFeatured ? "bg-black text-white" : "bg-[#e8e8e8] text-black",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h2
                            className={cn(
                              "text-left font-heading text-xl font-bold sm:text-2xl",
                              isFeatured ? "text-white" : "text-black",
                            )}
                          >
                            {plan.duration}
                          </h2>
                          {plan.tag ? (
                            <span
                              className={cn(
                                "shrink-0 rounded px-2 py-0.5 font-sans text-xs font-semibold",
                                isFeatured
                                  ? "bg-white/15 text-white"
                                  : "bg-black text-white",
                              )}
                            >
                              {plan.tag}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-5">
                          <PriceDisplay
                            amount={String(Math.round(plan.price))}
                            inverted={isFeatured}
                          />
                        </div>

                        <p
                          className={cn(
                            "mt-2 text-left font-sans text-sm font-normal",
                            isFeatured ? "text-white/90" : "text-neutral-700",
                          )}
                        >
                          {billingPeriodLabel(plan.duration)}
                        </p>

                        <div className="mt-6">
                          <PlanActionButton
                            plan={plan}
                            isFeatured={isFeatured}
                            isPlansLoading={isPlansLoading}
                          />
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex flex-1 flex-col border-t border-black/10 px-0 pb-2 pt-0",
                          isFeatured ? "bg-[#c9b896]" : "bg-[#f0f0f0]",
                        )}
                      >
                        {features.length > 0 ? (
                          <ul className="flex list-none flex-col p-0">
                            {features.map((feature, idx) => (
                              <li
                                key={`${plan.id}-${feature}`}
                                className={cn(
                                  "flex gap-3 border-b border-black/10 px-5 py-3.5 font-sans text-sm leading-snug sm:px-6 sm:text-[15px]",
                                  idx === features.length - 1 && "border-b-0",
                                )}
                              >
                                <Check
                                  className="mt-0.5 size-[18px] shrink-0 text-black"
                                  strokeWidth={2.5}
                                  aria-hidden
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-5 py-4 font-sans text-sm text-neutral-600 sm:px-6">
                            Plan details coming soon.
                          </p>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
