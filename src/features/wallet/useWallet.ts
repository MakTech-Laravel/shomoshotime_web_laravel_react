import { useQuery } from "@tanstack/react-query";

import { fetchWalletSummary, fetchWalletTransactions } from "./walletApi";

export const walletQueryKeys = {
  summary: ["wallet-summary"] as const,
  transactions: ["wallet-transactions"] as const,
};

export function useWalletSummary() {
  return useQuery({
    queryKey: walletQueryKeys.summary,
    queryFn: fetchWalletSummary,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: walletQueryKeys.transactions,
    queryFn: fetchWalletTransactions,
  });
}
