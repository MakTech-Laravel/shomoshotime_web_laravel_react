import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type CheckoutSessionResponse = {
  checkout_url: string;
  session_id: string;
};

export type CheckoutStatusResponse = {
  payment_status: string;
  fulfilled: boolean;
  subscription_status?: string | null;
};

export type ActiveWebSubscription = {
  planName: string;
  price: string;
  paymentMethod: string;
  startDate: string;
  renewsAt: string;
  statusLabel: string;
  status: "Active" | "Cancelling";
  cancelAtPeriodEnd: boolean;
  billingSource: string | null;
};

export async function createSubscriptionCheckoutSession(
  subscriptionId: number,
): Promise<CheckoutSessionResponse> {
  const res = await api.post(userEndpoints.stripeSubscriptionCheckout, {
    subscription_id: subscriptionId,
  });
  const data = unwrapLaravelData<CheckoutSessionResponse>(res.data);
  if (!data?.checkout_url) {
    throw new Error("Subscription checkout session response was invalid.");
  }
  return data;
}

export async function fetchSubscriptionCheckoutStatus(
  sessionId: string,
): Promise<CheckoutStatusResponse> {
  const res = await api.post(userEndpoints.stripeSubscriptionStatus, {
    session_id: sessionId,
  });
  const data = unwrapLaravelData<CheckoutStatusResponse>(res.data);
  if (!data) {
    throw new Error("Subscription checkout status response was invalid.");
  }
  return data;
}

export async function fetchActiveWebSubscription(): Promise<ActiveWebSubscription | null> {
  try {
    const res = await api.post(userEndpoints.stripeSubscriptionActive, {});
    const data = unwrapLaravelData<Record<string, unknown>>(res.data);
    if (!data) return null;

    const row =
      data.subscription && typeof data.subscription === "object"
        ? (data.subscription as Record<string, unknown>)
        : null;
    const plan =
      row?.subscription && typeof row.subscription === "object"
        ? (row.subscription as Record<string, unknown>)
        : null;

    const duration = plan?.duration != null ? String(plan.duration) : "Premium";
    const priceValue = plan?.price != null ? Number(plan.price) : NaN;
    const price = Number.isFinite(priceValue) ? `$${priceValue.toFixed(2)}` : "—";
    const cancelAtPeriodEnd = Boolean(data.cancel_at_period_end);
    const renewsAt = data.renews_at != null ? String(data.renews_at) : "—";
    const startsAt = row?.starts_at != null ? String(row.starts_at) : "—";

    return {
      planName: duration,
      price,
      paymentMethod: "Stripe — auto-renew",
      startDate: startsAt,
      renewsAt,
      statusLabel: cancelAtPeriodEnd ? `Cancels on ${renewsAt}` : `Renews on ${renewsAt}`,
      status: cancelAtPeriodEnd ? "Cancelling" : "Active",
      cancelAtPeriodEnd,
      billingSource:
        data.billing_source != null ? String(data.billing_source) : null,
    };
  } catch {
    return null;
  }
}

export async function cancelWebSubscription(): Promise<{ ends_at: string }> {
  const res = await api.post(userEndpoints.stripeSubscriptionCancel, {});
  const data = unwrapLaravelData<Record<string, unknown>>(res.data);
  return {
    ends_at: data?.ends_at != null ? String(data.ends_at) : "",
  };
}

/** @deprecated Legacy one-time checkout — retained for reference only. */
export async function createCheckoutSession(subscriptionId: number): Promise<CheckoutSessionResponse> {
  const res = await api.post(userEndpoints.stripeCheckoutSession, {
    subscription_id: subscriptionId,
  });
  const data = unwrapLaravelData<CheckoutSessionResponse>(res.data);
  if (!data?.checkout_url) {
    throw new Error("Checkout session response was invalid.");
  }
  return data;
}

/** @deprecated Legacy one-time checkout status. */
export async function fetchCheckoutSessionStatus(sessionId: string): Promise<CheckoutStatusResponse> {
  const res = await api.post(userEndpoints.stripeCheckoutStatus, {
    session_id: sessionId,
  });
  const data = unwrapLaravelData<CheckoutStatusResponse>(res.data);
  if (!data) {
    throw new Error("Checkout status response was invalid.");
  }
  return data;
}
