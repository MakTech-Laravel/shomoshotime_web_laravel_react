import { Link, useLocation } from "react-router-dom";

import {
  USER_ACCOUNT_TABS,
  parseUserAccountViewFromPath,
  userAccountHref,
} from "@/lib/userAccountNav";
import { cn } from "@/lib/utils";

export function UserAccountTabs() {
  const { pathname } = useLocation();
  const activeView = parseUserAccountViewFromPath(pathname);

  return (
    <nav
      className="flex gap-6 overflow-x-auto border-b border-transparent font-montserrat text-[15px] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden"
      aria-label="Account sections"
    >
      {USER_ACCOUNT_TABS.map(({ label, view }) => {
        const isActive = activeView === view;
        return (
          <Link
            key={view}
            to={userAccountHref(view)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 pb-2.5 transition-colors",
              isActive
                ? "border-[#6b6b6b] font-medium text-[#5c5c5c]"
                : "border-transparent font-normal text-[#9a9a9a] hover:text-[#777]",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
