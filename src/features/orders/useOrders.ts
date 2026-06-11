import { useQuery } from "@tanstack/react-query";

import { fetchUserOrders } from "./ordersApi";

export const ordersQueryKeys = {
  list: ["user-orders"] as const,
};

export function useUserOrders() {
  return useQuery({
    queryKey: ordersQueryKeys.list,
    queryFn: fetchUserOrders,
  });
}
