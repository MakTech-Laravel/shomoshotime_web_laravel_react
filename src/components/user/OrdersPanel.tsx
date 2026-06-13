import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useUserOrders } from "@/features/orders/useOrders";
import { cn } from "@/lib/utils";

function statusBadgeClass(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized === "paid" || normalized === "success") {
    return "bg-[#e8f5e9] text-[#2e7d32]";
  }
  if (normalized === "pending") {
    return "bg-[#fff8e1] text-[#f57f17]";
  }
  if (normalized === "failed") {
    return "bg-[#ffebee] text-[#c62828]";
  }
  return "bg-[#f5f5f5] text-[#616161]";
}

export function OrdersPanel() {
  const { data: orders = [], isLoading } = useUserOrders();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        Orders
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        View your order history and receipts.
      </p>

      {isLoading ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            Loading…
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            No items to display yet.
          </p>
        </div>
      ) : (
        <div className="mt-7 border-t border-[#e0e0e0]">
          {orders.map((order) => {
            const expanded = expandedId === order.id;

            return (
              <div key={order.id} className="border-b border-[#e0e0e0]">
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-[1.125rem]">
                  <p
                    className={cn(
                      "font-montserrat text-[15px] text-black sm:w-1/3 sm:text-base",
                      expanded ? "font-semibold" : "font-normal",
                    )}
                  >
                    {order.planName}
                  </p>

                  <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:w-1/3 sm:text-center sm:text-base">
                    {order.createdAt}
                  </p>

                  <div className="flex sm:w-1/3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId((current) => (current === order.id ? null : order.id))}
                      aria-expanded={expanded}
                      aria-controls={`order-details-${order.id}`}
                      className="inline-flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80"
                    >
                      <span
                        className={cn(
                          "inline-flex rounded px-2.5 py-0.5 font-montserrat text-[14px] font-semibold leading-snug",
                          statusBadgeClass(order.statusLabel),
                        )}
                      >
                        {order.statusLabel}
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
                    id={`order-details-${order.id}`}
                    className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-3 sm:gap-0"
                  >
                    <div className="space-y-1.5 font-montserrat text-[15px] font-normal text-[#757575] sm:text-base">
                      <p>{order.amountDisplay}</p>
                      <p>{order.paymentMethod ?? "—"}</p>
                      {order.transactionId ? <p>Ref: {order.transactionId}</p> : null}
                    </div>

                    <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:text-center sm:text-base">
                      Order #{order.id}
                    </p>

                    <div className="hidden sm:block" aria-hidden />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
