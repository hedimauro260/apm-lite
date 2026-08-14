import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { cn, formatCurrency, formatQuantity } from "../../lib/utils";
import { Pagination } from "../../components/ui/Pagination";
import type { AssetMovement } from "../../types";
import type { Wallet } from "../../types";
import { MovementContextMenu } from "./MovementContextMenu";

export interface AssetsActivityProps {
  movements: AssetMovement[];
  wallets: Wallet[];
  onEdit: (movement: AssetMovement) => void;
  onDelete: (movement: AssetMovement) => void;
}

const PAGE_SIZE = 10;

export function AssetsActivity({
  movements,
  wallets,
  onEdit,
  onDelete,
}: AssetsActivityProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedMovements = useMemo(() => {
    return [...movements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [movements]);

  useEffect(() => {
    setCurrentPage(1);
  }, [movements.length]);

  const totalPages = Math.max(1, Math.ceil(sortedMovements.length / PAGE_SIZE));
  const displayedMovements = sortedMovements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { datePart, timePart };
  };

  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-text-muted" />
          <h2 className="text-xs font-semibold text-text-primary">
            All Activity
          </h2>
        </div>
        <span className="text-xs text-text-muted">
          {sortedMovements.length} record{sortedMovements.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-180">
          <thead>
            <tr className="border-b border-border bg-surface-elevated">
              {["Asset", "Quantity", "Value USD", "Wallet", "Date", "Action", "Options"].map(
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
            {displayedMovements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                  No activity yet. Add or remove assets to see records here.
                </td>
              </tr>
            ) : (
              displayedMovements.map((movement) => {
                const { datePart, timePart } = formatDisplayDate(movement.date);
                const isAdd = movement.actionType === "add";
                return (
                  <tr key={movement.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "p-1.5 rounded",
                            isAdd
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger",
                          )}
                        >
                          {isAdd ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            {movement.assetName}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {movement.assetSymbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span className="text-xs text-text-secondary font-mono">
                        {formatQuantity(movement.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="text-xs font-semibold text-text-primary font-mono">
                        {formatCurrency(movement.currentValue)}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="text-xs text-text-secondary">
                        {walletName(movement.walletId)}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <div>
                        <p className="text-xs text-text-primary">{datePart}</p>
                        <p className="text-[10px] text-text-muted">{timePart}</p>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-medium capitalize",
                          isAdd
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger",
                        )}
                      >
                        {movement.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <MovementContextMenu
                        movement={movement}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
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
          totalItems={sortedMovements.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}