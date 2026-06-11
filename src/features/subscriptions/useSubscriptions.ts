import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelSubscription,
  fetchSubscriptionCheck,
  fetchSubscriptionPlans,
} from "./subscriptionsApi";

export const subscriptionQueryKeys = {
  check: ["subscription-check"] as const,
  plans: ["subscription-plans"] as const,
};

export function useSubscriptionCheck() {
  return useQuery({
    queryKey: subscriptionQueryKeys.check,
    queryFn: fetchSubscriptionCheck,
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans,
    queryFn: fetchSubscriptionPlans,
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
