import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, History } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";
import { Pagination } from "../../components/ui/Pagination";
import type { Transaction, Wallet } from "../../types";
import { walletDisplayName } from "./goalLogic";

const PAGE_SIZE = 20;

export interface RecentGoalActivityProps {
  transactions: Transaction[];
  wallets: Wallet[];
}

export function RecentGoalActivity({
  transactions,
  wallets,
}: RecentGoalActivityProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const deposits = useMemo(() => {
    return transactions
      .filter((t) => t.type === "deposit")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deposits.length]);

  const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE));
  const displayedDeposits = deposits.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      datePart: date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      timePart: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-text-muted" />
          <h2 className="text-xs font-semibold text-text-primary">
            Recent Goal Activity
          </h2>
        </div>
        <span className="text-xs text-text-muted">
          {deposits.length} deposit{deposits.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-180">
          <thead>
            <tr className="border-b border-border bg-surface-elevated">
              {["Deposit", "Amount", "Website", "Goal Eligibility", "Date"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedDeposits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                  No deposits yet. Add funds to see them here.
                </td>
              </tr>
            ) : (
              displayedDeposits.map((deposit) => {
                const { datePart, timePart } = formatDisplayDate(deposit.date);
                const eligible = deposit.countsTowardsGoals !== false;
                return (
                  <tr
                    key={deposit.id}
                    className="hover:bg-surface-elevated/50 transition-colors"
                  >
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "p-2 rounded",
                            eligible
                              ? "bg-success/10 text-success"
                              : "bg-surface-elevated text-text-muted",
                          )}
                        >
                          <ArrowDownRight className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            {walletDisplayName(deposit.walletId, wallets)}
                          </p>
                          {deposit.description && (
                            <p className="text-[10px] text-text-muted truncate max-w-50">
                              {deposit.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span className="text-xs font-semibold text-success font-mono">
                        +{formatCurrency(Math.abs(deposit.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="text-xs text-text-secondary">
                        {deposit.website || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-medium",
                          eligible
                            ? "bg-success/10 text-success"
                            : "bg-surface-elevated text-text-muted",
                        )}
                      >
                        {eligible ? "Counts toward goals" : "Not counted"}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <div>
                        <p className="text-xs text-text-primary">{datePart}</p>
                        <p className="text-[10px] text-text-muted">{timePart}</p>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-6 py-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={deposits.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
