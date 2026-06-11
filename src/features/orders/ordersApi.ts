import { api } from "@/api/client";
import { unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type UserOrder = {
  id: number;
  subscriptionId: number | null;
  planName: string;
  amountDisplay: string;
  currency: string;
  paymentMethod: string | null;
  transactionId: string | null;
  statusLabel: string;
  createdAt: string;
};

function normalizeOrder(raw: unknown): UserOrder | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;

  const subscription =
    o.subscription && typeof o.subscription === "object"
      ? (o.subscription as Record<string, unknown>)
      : null;

  const planName =
    subscription && typeof subscription.duration === "string" && subscription.duration
      ? subscription.duration
      : "Subscription";

  const statusLabel =
    typeof o.status_label === "string" && o.status_label ? o.status_label : "Paid";

  const amountDisplay =
    typeof o.amount_display === "string" && o.amount_display
      ? o.amount_display
      : typeof o.amount === "number"
        ? `$${o.amount.toFixed(2)}`
        : "—";

  return {
    id,
    subscriptionId:
      typeof o.subscription_id === "number"
        ? o.subscription_id
        : subscription && typeof subscription.id === "number"
          ? subscription.id
          : null,
    planName,
    amountDisplay,
    currency: typeof o.currency === "string" ? o.currency : "USD",
    paymentMethod:
      typeof o.payment_method === "string" && o.payment_method ? o.payment_method : null,
    transactionId:
      typeof o.transaction_id === "string" && o.transaction_id ? o.transaction_id : null,
    statusLabel,
    createdAt: typeof o.created_at === "string" ? o.created_at : "—",
  };
}

export async function fetchUserOrders(): Promise<UserOrder[]> {
  const res = await api.post(userEndpoints.paymentList, { per_page: 50 });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizeOrder).filter((order): order is UserOrder => order !== null);
}
