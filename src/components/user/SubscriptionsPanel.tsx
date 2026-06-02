import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Demo subscription — wire to API when backend is ready. */
const DEMO_SUBSCRIPTION = {
  planName: "Annual",
  statusLabel: "Valid until canceled",
  status: "Active" as const,
  price: "$249.00 per year",
  paymentMethod: "Offline payment",
  startDate: "May 22, 2026",
};

export function SubscriptionsPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        Subscriptions
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        View and manage the subscriptions you&apos;ve purchased.
      </p>

      <div className="mt-7 border-t border-[#e0e0e0]">
        <div className="border-b border-[#e0e0e0]">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-[1.125rem]">
            <p
              className={cn(
                "font-montserrat text-[15px] text-black sm:w-1/3 sm:text-base",
                expanded ? "font-semibold" : "font-normal",
              )}
            >
              {DEMO_SUBSCRIPTION.planName}
            </p>

            <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:w-1/3 sm:text-center sm:text-base">
              {DEMO_SUBSCRIPTION.statusLabel}
            </p>

            <div className="flex sm:w-1/3 sm:justify-end">
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                aria-controls="subscription-details"
                className="inline-flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80"
              >
                <span className="inline-flex rounded bg-[#e8f5e9] px-2.5 py-0.5 font-montserrat text-[14px] font-semibold leading-snug text-[#2e7d32]">
                  {DEMO_SUBSCRIPTION.status}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-[#9e9e9e] transition-transform duration-200",
                    expanded && "rotate-180",
                  )}
                  strokeWidth={2.5}
                  aria-hidden
                />
              </button>
            </div>
          </div>

          {expanded ? (
            <div
              id="subscription-details"
              className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-3 sm:gap-0"
            >
              <div className="space-y-1.5 font-montserrat text-[15px] font-normal text-[#757575] sm:text-base">
                <p>{DEMO_SUBSCRIPTION.price}</p>
                <p>{DEMO_SUBSCRIPTION.paymentMethod}</p>
                <button
                  type="button"
                  className="mt-4 block font-montserrat text-[15px] font-normal text-black underline underline-offset-2 transition hover:text-[#333]"
                >
                  Cancel Subscription
                </button>
              </div>

              <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:text-center sm:text-base">
                Start date: {DEMO_SUBSCRIPTION.startDate}
              </p>

              <div className="hidden sm:block" aria-hidden />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
