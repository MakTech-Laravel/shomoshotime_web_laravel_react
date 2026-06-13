import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useWalletSummary, useWalletTransactions } from "@/features/wallet/useWallet";
import { cn } from "@/lib/utils";

function typeBadgeClass(type: string): string {
  if (type === "deposit") {
    return "bg-[#e8f5e9] text-[#2e7d32]";
  }
  return "bg-[#ffebee] text-[#c62828]";
}

export function WalletPanel() {
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactions = [], isLoading: txLoading } = useWalletTransactions();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const isLoading = summaryLoading || txLoading;
  const rows = transactions.length > 0 ? transactions : (summary?.recentTransactions ?? []);

  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        Wallet
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        View your wallet balance and transactions.
      </p>

      {summary ? (
        <p className="mt-5 font-montserrat text-base text-black">
          Balance:{" "}
          <span className="font-semibold">{summary.balanceDisplay}</span>
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            Loading…
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            No items to display yet.
          </p>
        </div>
      ) : (
        <div className="mt-7 border-t border-[#e0e0e0]">
          {rows.map((tx) => {
            const expanded = expandedId === tx.id;

            return (
              <div key={tx.id} className="border-b border-[#e0e0e0]">
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-[1.125rem]">
                  <p
                    className={cn(
                      "font-montserrat text-[15px] text-black sm:w-1/3 sm:text-base",
                      expanded ? "font-semibold" : "font-normal",
                    )}
                  >
                    {tx.description ?? tx.typeLabel}
                  </p>

                  <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:w-1/3 sm:text-center sm:text-base">
                    {tx.createdAt}
                  </p>

                  <div className="flex sm:w-1/3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId((current) => (current === tx.id ? null : tx.id))}
                      aria-expanded={expanded}
                      className="inline-flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80"
                    >
                      <span
                        className={cn(
                          "inline-flex rounded px-2.5 py-0.5 font-montserrat text-[14px] font-semibold leading-snug",
                          typeBadgeClass(tx.type),
                        )}
                      >
                        {tx.typeLabel}
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
                  <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-3 sm:gap-0">
                    <div className="space-y-1.5 font-montserrat text-[15px] font-normal text-[#757575] sm:text-base">
                      <p>{tx.amountDisplay}</p>
                      <p>{tx.statusLabel}</p>
                    </div>

                    <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:text-center sm:text-base">
                      {tx.currency}
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
