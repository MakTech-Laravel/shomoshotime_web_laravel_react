import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createCheckoutSession } from "./checkoutApi";
import { fetchPublicSubscriptionPlans } from "./publicPlansApi";
import {
  cancelSubscription,
  fetchSubscriptionCheck,
  fetchSubscriptionPlans,
} from "./subscriptionsApi";

export const subscriptionQueryKeys = {
  check: ["subscription-check"] as const,
  plans: ["subscription-plans"] as const,
  publicPlans: ["public-subscription-plans"] as const,
};

export function useSubscriptionCheck(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionQueryKeys.check,
    queryFn: fetchSubscriptionCheck,
    enabled: options?.enabled ?? true,
  });
}

export function useSubscriptionPlans(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans,
    queryFn: fetchSubscriptionPlans,
    enabled: options?.enabled ?? true,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

export function usePublicSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionQueryKeys.publicPlans,
    queryFn: fetchPublicSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.check });
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const result = await createCheckoutSession(subscriptionId);
      window.location.assign(result.checkout_url);
      return result;
    },
  });
}
