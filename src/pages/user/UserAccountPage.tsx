import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AccountPlaceholderPanel } from "@/components/user/AccountPlaceholderPanel";
import { AccountSettingsPanel } from "@/components/user/AccountSettingsPanel";
import { SubscriptionsPanel } from "@/components/user/SubscriptionsPanel";
import { UserAccountLayout } from "@/components/user/UserAccountLayout";
import { parseUserAccountViewFromPath } from "@/lib/userAccountNav";

const VIEW_TITLES: Record<
  ReturnType<typeof parseUserAccountViewFromPath>,
  { title: string; description: string }
> = {
  subscriptions: {
    title: "Subscriptions",
    description: "View and manage the subscriptions you've purchased.",
  },
  orders: {
    title: "Orders",
    description: "View your order history and receipts.",
  },
  addresses: {
    title: "Addresses",
    description: "Manage your billing and shipping addresses.",
  },
  wallet: {
    title: "Wallet",
    description: "View your wallet balance and transactions.",
  },
  account: {
    title: "My Account",
    description: "Update your profile and account settings.",
  },
};

export default function UserAccountPage() {
  const { pathname } = useLocation();
  const view = parseUserAccountViewFromPath(pathname);
  const meta = VIEW_TITLES[view];

  useEffect(() => {
    document.title = `${meta.title} | Sonographer Pal`;
  }, [meta.title]);

  return (
    <UserAccountLayout>
      {view === "subscriptions" ? (
        <SubscriptionsPanel />
      ) : view === "account" ? (
        <AccountSettingsPanel />
      ) : (
        <AccountPlaceholderPanel title={meta.title} description={meta.description} />
      )}
    </UserAccountLayout>
  );
}
