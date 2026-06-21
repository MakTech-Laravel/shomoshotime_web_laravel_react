import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/auth/useAuth";
import { fetchSubscriptionCheckoutStatus } from "@/features/subscriptions/checkoutApi";
import {
  subscriptionQueryKeys,
  useActiveWebSubscription,
  useCancelWebSubscription,
  useSubscriptionCheck,
} from "@/features/subscriptions/useSubscriptions";
import { cn } from "@/lib/utils";

export function SubscriptionsPanel() {
  const [expanded, setExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutHandled = useRef(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: isPremium, isLoading: checkLoading } = useSubscriptionCheck({
    enabled: Boolean(user),
  });
  const { data: webSubscription, isLoading: activeLoading } = useActiveWebSubscription({
    enabled: Boolean(user) && (isPremium === true || user?.is_premium === true),
  });
  const cancelMutation = useCancelWebSubscription();

  const active = isPremium === true || user?.is_premium === true;

  const subscription = webSubscription ?? {
    planName: "Premium",
    statusLabel: "Active subscription",
    status: "Active" as const,
    price: "—",
    paymentMethod: "Subscription",
    startDate: "—",
    renewsAt: "—",
    cancelAtPeriodEnd: false,
    billingSource: null,
  };

  useEffect(() => {
    if (checkoutHandled.current) return;
    if (searchParams.get("checkout") !== "success") return;

    const sessionId = searchParams.get("session_id");
    checkoutHandled.current = true;

    toast.success("Payment received — activating your subscription…");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("checkout");
    nextParams.delete("session_id");
    setSearchParams(nextParams, { replace: true });

    async function confirmCheckout() {
      if (sessionId) {
        for (let attempt = 0; attempt < 8; attempt += 1) {
          try {
            const status = await fetchSubscriptionCheckoutStatus(sessionId);
            if (status.fulfilled || status.payment_status === "paid") {
              break;
            }
          } catch {
            // Webhook may still be processing; retry briefly.
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      await queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.check });
      await queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.activeWeb });
      await queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.publicPlans });
    }

    void confirmCheckout();
  }, [queryClient, searchParams, setSearchParams]);

  async function handleCancel() {
    try {
      const result = await cancelMutation.mutateAsync();
      toast.success(
        result.ends_at
          ? `Subscription will end on ${result.ends_at}.`
          : "Subscription will cancel at the end of your billing period.",
      );
      setExpanded(false);
    } catch {
      toast.error("Unable to cancel subscription. Please try again.");
    }
  }

  const showCancel =
    active && webSubscription?.billingSource === "stripe_recurring" && !webSubscription.cancelAtPeriodEnd;

  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        Subscriptions
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        View and manage the subscriptions you&apos;ve purchased.
      </p>

      {checkLoading || (active && activeLoading) ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            Loading…
          </p>
        </div>
      ) : !active ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <div className="py-10 text-center">
            <p className="font-montserrat text-[15px] font-normal text-[#9a9a9a]">
              You don&apos;t have an active subscription yet.
            </p>
            <Link
              to="/pricing-plans"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-black px-5 py-2.5 font-montserrat text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              View Plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <div className="border-b border-[#e0e0e0]">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-[1.125rem]">
              <p
                className={cn(
                  "font-montserrat text-[15px] text-black sm:w-1/3 sm:text-base",
                  expanded ? "font-semibold" : "font-normal",
                )}
              >
                {subscription.planName}
              </p>

              <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:w-1/3 sm:text-center sm:text-base">
                {subscription.statusLabel}
              </p>

              <div className="flex sm:w-1/3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setExpanded((open) => !open)}
                  aria-expanded={expanded}
                  aria-controls="subscription-details"
                  className="inline-flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80"
                >
                  <span
                    className={cn(
                      "inline-flex rounded px-2.5 py-0.5 font-montserrat text-[14px] font-semibold leading-snug",
                      subscription.status === "Cancelling"
                        ? "bg-[#fff3e0] text-[#e65100]"
                        : "bg-[#e8f5e9] text-[#2e7d32]",
                    )}
                  >
                    {subscription.status}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-[#9e9e9e] transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </button>
              </div>
            </div>

            {expanded ? (
              <div
                id="subscription-details"
                className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-3 sm:gap-0"
              >
                <div className="space-y-1.5 font-montserrat text-[15px] font-normal text-[#757575] sm:text-base">
                  <p>{subscription.price}</p>
                  <p>{subscription.paymentMethod}</p>
                  {showCancel ? (
                    <button
                      type="button"
                      disabled={cancelMutation.isPending}
                      onClick={() => void handleCancel()}
                      className="mt-4 block font-montserrat text-[15px] font-normal text-black underline underline-offset-2 transition hover:text-[#333] disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? "Cancelling…" : "Cancel Subscription"}
                    </button>
                  ) : null}
                </div>

                <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:text-center sm:text-base">
                  Start date: {subscription.startDate}
                  <br />
                  {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}: {subscription.renewsAt}
                </p>

                <div className="hidden sm:block" aria-hidden />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
