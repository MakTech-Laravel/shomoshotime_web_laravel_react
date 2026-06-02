import type { ReactNode } from "react";

import { UserAccountTabs } from "@/components/user/UserAccountTabs";
import { UserProfileBanner } from "@/components/user/UserProfileBanner";
import { cn } from "@/lib/utils";

type UserAccountLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function UserAccountLayout({ children, className }: UserAccountLayoutProps) {
  return (
    <div className={cn("min-h-[70vh] bg-white pb-16 font-montserrat", className)}>
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <UserProfileBanner />
        <UserAccountTabs />
        {children}
      </div>
    </div>
  );
}
