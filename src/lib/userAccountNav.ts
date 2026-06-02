export type UserAccountView = "subscriptions" | "orders" | "addresses" | "wallet" | "account";

/** URL segment under `/account/` (no dashboard in user paths). */
export const USER_ACCOUNT_PATH_SEGMENTS: Record<UserAccountView, string> = {
  subscriptions: "my-subscriptions",
  orders: "my-orders",
  addresses: "my-addresses",
  wallet: "my-wallet",
  account: "my-account",
};

export const USER_ACCOUNT_DEFAULT_PATH = `/account/${USER_ACCOUNT_PATH_SEGMENTS.subscriptions}`;

export const USER_ACCOUNT_TABS: { label: string; view: UserAccountView }[] = [
  { label: "My Subscriptions", view: "subscriptions" },
  { label: "My Orders", view: "orders" },
  { label: "My Addresses", view: "addresses" },
  { label: "My Wallet", view: "wallet" },
  { label: "My Account", view: "account" },
];

const SEGMENT_TO_VIEW = Object.fromEntries(
  Object.entries(USER_ACCOUNT_PATH_SEGMENTS).map(([view, segment]) => [segment, view]),
) as Record<string, UserAccountView>;

export function userAccountHref(view: UserAccountView): string {
  return `/account/${USER_ACCOUNT_PATH_SEGMENTS[view]}`;
}

export function parseUserAccountViewFromPath(pathname: string): UserAccountView {
  const match = pathname.match(/^\/account\/([^/?#]+)/);
  const segment = match?.[1];
  if (segment && SEGMENT_TO_VIEW[segment]) {
    return SEGMENT_TO_VIEW[segment];
  }
  return "subscriptions";
}

/** @deprecated Use parseUserAccountViewFromPath — kept for legacy ?view= query redirects. */
export function parseUserAccountView(raw: string | null): UserAccountView {
  const map: Record<string, UserAccountView> = {
    subscriptions: "subscriptions",
    orders: "orders",
    addresses: "addresses",
    wallet: "wallet",
    account: "account",
  };
  if (raw && map[raw]) return map[raw];
  return "subscriptions";
}
