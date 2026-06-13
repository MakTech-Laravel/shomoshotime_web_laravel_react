import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type WalletTransaction = {
  id: number;
  type: "deposit" | "withdrawal";
  typeLabel: string;
  amountDisplay: string;
  currency: string;
  statusLabel: string;
  description: string | null;
  createdAt: string;
};

export type WalletSummary = {
  balanceDisplay: string;
  currency: string;
  recentTransactions: WalletTransaction[];
};

function normalizeTransaction(raw: unknown): WalletTransaction | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;

  const type = o.type === "deposit" ? "deposit" : "withdrawal";

  return {
    id,
    type,
    typeLabel: typeof o.type_label === "string" ? o.type_label : type === "deposit" ? "Deposit" : "Withdrawal",
    amountDisplay: typeof o.amount_display === "string" ? o.amount_display : "—",
    currency: typeof o.currency === "string" ? o.currency : "USD",
    statusLabel: typeof o.status_label === "string" ? o.status_label : "Completed",
    description: typeof o.description === "string" ? o.description : null,
    createdAt: typeof o.created_at === "string" ? o.created_at : "—",
  };
}

export async function fetchWalletSummary(): Promise<WalletSummary> {
  const res = await api.post(userEndpoints.walletSummary, {});
  const data = unwrapLaravelData<Record<string, unknown>>(res.data) ?? {};
  const recentRaw = data.recent_transactions;
  const recent = Array.isArray(recentRaw)
    ? recentRaw.map(normalizeTransaction).filter((t): t is WalletTransaction => t !== null)
    : [];

  return {
    balanceDisplay: typeof data.balance_display === "string" ? data.balance_display : "$0.00",
    currency: typeof data.currency === "string" ? data.currency : "USD",
    recentTransactions: recent,
  };
}

export async function fetchWalletTransactions(): Promise<WalletTransaction[]> {
  const res = await api.post(userEndpoints.walletTransactionsList, { per_page: 50 });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizeTransaction).filter((t): t is WalletTransaction => t !== null);
}
