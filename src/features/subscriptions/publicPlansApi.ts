import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import { publicEndpoints } from "@/config/publicEndpoints";
import {
  normalizeSubscriptionPlan,
  type SubscriptionPlan,
} from "@/features/subscriptions/subscriptionsApi";

export async function fetchPublicSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await api.get(publicEndpoints.subscriptionPlans);
  const data = unwrapLaravelData<unknown[]>(res.data);
  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeSubscriptionPlan)
    .filter((plan): plan is SubscriptionPlan => plan !== null)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
