import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelWebSubscription,
  createSubscriptionCheckoutSession,
  fetchActiveWebSubscription,
} from "./checkoutApi";
import { fetchPublicSubscriptionPlans } from "./publicPlansApi";
import {
  fetchSubscriptionCheck,
  fetchSubscriptionPlans,
} from "./subscriptionsApi";

export const subscriptionQueryKeys = {
  check: ["subscription-check"] as const,
  plans: ["subscription-plans"] as const,
  publicPlans: ["public-subscription-plans"] as const,
  activeWeb: ["active-web-subscription"] as const,
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

export function useActiveWebSubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionQueryKeys.activeWeb,
    queryFn: fetchActiveWebSubscription,
    enabled: options?.enabled ?? true,
    retry: 1,
  });
}

export function useCancelWebSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelWebSubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.check });
      void queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.activeWeb });
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const result = await createSubscriptionCheckoutSession(subscriptionId);
      window.location.assign(result.checkout_url);
      return result;
    },
  });
}
