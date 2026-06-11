import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type SubscriptionPlan = {
  id: number;
  duration: string;
  price: number;
  tag: string | null;
  features: string[] | null;
};

function normalizePlan(raw: unknown): SubscriptionPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;
  let features: string[] | null = null;
  if (Array.isArray(o.features)) {
    features = o.features.map(String);
  } else if (typeof o.features === "string") {
    try {
      const parsed = JSON.parse(o.features);
      if (Array.isArray(parsed)) features = parsed.map(String);
    } catch {
      features = [o.features];
    }
  }
  return {
    id,
    duration: String(o.duration ?? ""),
    price: Number(o.price ?? 0),
    tag: o.tag != null ? String(o.tag) : null,
    features,
  };
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await api.post(userEndpoints.subscriptionList, { per_page: 20 });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizePlan).filter((p): p is SubscriptionPlan => p !== null);
}

export async function fetchSubscriptionCheck(): Promise<boolean> {
  const res = await api.post(userEndpoints.subscriptionCheck, {});
  const data = unwrapLaravelData<{ is_premium?: boolean }>(res.data);
  return Boolean(data?.is_premium);
}

export async function cancelSubscription(): Promise<void> {
  await api.post(userEndpoints.subscriptionCancel, {});
}

export async function fetchStripePublishableKey(): Promise<string | null> {
  const res = await api.post(userEndpoints.stripeKeys, {});
  const data = unwrapLaravelData<Record<string, unknown>>(res.data);
  const key = data?.publishable_key;
  return typeof key === "string" && key.length > 0 ? key : null;
}

export async function storePayment(payload: {
  subscription_id: number;
  amount: number;
  payment_intent_data?: unknown;
}): Promise<void> {
  await api.post(userEndpoints.paymentStore, payload);
}
