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
};

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
