import type { ReactNode } from "react";
import { ArrowDownRight, CalendarDays, Wallet as WalletIcon } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { cn, formatCurrency, formatDateTime } from "../../lib/utils";
import {
  formatDayLabel,
  getStatusClasses,
  walletDisplayName,
} from "./goalLogic";
import type { Goal, Wallet } from "../../types";

export interface GoalDetailModalProps {
  open: boolean;
  goal: Goal | null;
  wallets: Wallet[];
  onClose: () => void;
}

export function GoalDetailModal({
  open,
  goal,
  wallets,
  onClose,
}: GoalDetailModalProps) {
  const snapshot = goal?.snapshot;

  const StatItem = ({
    label,
    value,
  }: {
    label: string;
    value: ReactNode;
  }) => (
    <div className="rounded-lg bg-surface-elevated/60 border border-border px-4 py-3">
      <p className="text-[10px] text-text-muted">{label}</p>
      <div className="mt-1 text-sm font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Goal Details"
      description={
        goal ? `Archived goal · ${formatDayLabel(goal.startDate)} – ${formatDayLabel(goal.endDate)}` : undefined
      }
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!goal || !snapshot ? (
        <div className="py-12 text-center text-text-muted text-sm">
          No snapshot available for this goal.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-elevated border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {goal.name}
              </p>
              <p className="text-xs text-text-muted">
                Archived on {formatDateTime(snapshot.archivedAt)}
              </p>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium shrink-0",
                getStatusClasses(snapshot.status),
              )}
            >
              {snapshot.status}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <StatItem
              label="Wallets Monitored"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {goal.wallets.map((wallet) => (
                    <span
                      key={wallet.walletId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface text-text-secondary text-[10px] font-medium border border-border"
                    >
                      <WalletIcon className="h-3 w-3" />
                      {walletDisplayName(wallet.walletId, wallets)}
                    </span>
                  ))}
                </div>
              }
            />
            <StatItem
              label="Weekly Goal"
              value={formatCurrency(snapshot.totalWeeklyGoal)}
            />
            <StatItem
              label="Weekly Progress"
              value={formatCurrency(snapshot.totalWeeklyProgress)}
            />
            <StatItem
              label="Remaining"
              value={formatCurrency(snapshot.remaining)}
            />
            <StatItem label="Current Streak" value={`${snapshot.streak} days`} />
            <StatItem
              label="Best Wallet"
              value={
                snapshot.bestWallet
                  ? `${snapshot.bestWallet.walletName} · ${snapshot.bestWallet.percentage.toFixed(1)}%`
                  : "No deposits"
              }
            />
          </div>

          {/* Daily breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">
                Daily Breakdown
              </span>
            </div>
            {snapshot.walletProgress.length === 0 ? (
              <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-text-muted">
                No wallets were tracked for this goal.
              </div>
            ) : (
              <div className="space-y-4">
                {snapshot.walletProgress.map((wallet) => (
                  <div
                    key={wallet.walletId}
                    className="rounded-md border border-border overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3 bg-surface-elevated/60 px-4 py-2.5 border-b border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        {wallet.color && (
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: wallet.color }}
                          />
                        )}
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {wallet.walletName}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          {formatCurrency(wallet.weeklyProgress)} /{" "}
                          {formatCurrency(wallet.weeklyGoal)}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium shrink-0",
                          getStatusClasses(wallet.status),
                        )}
                      >
                        {wallet.status}
                      </span>
                    </div>
                    <div className="min-w-0 overflow-x-auto">
                      <table className="w-full min-w-140">
                        <thead>
                          <tr className="border-b border-border bg-surface-elevated">
                            {[
                              "Day",
                              "Goal",
                              "Achieved",
                              "Progress",
                              "Status",
                            ].map((header) => (
                              <th
                                key={header}
                                className="px-4 py-2.5 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {wallet.days.map((day) => (
                            <tr key={day.date}>
                              <td className="px-4 py-2">
                                <span className="text-xs font-medium text-text-primary">
                                  {formatDayLabel(day.date)}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-xs text-text-secondary font-mono">
                                  {formatCurrency(day.goal)}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-xs font-semibold text-text-primary font-mono">
                                  {formatCurrency(day.current)}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-xs text-text-secondary tabular-nums">
                                  {day.percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-medium",
                                    getStatusClasses(day.status),
                                  )}
                                >
                                  {day.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deposits */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">
                Related Deposits
              </span>
            </div>
            {snapshot.deposits.length === 0 ? (
              <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-text-muted">
                No eligible deposits were recorded for this goal.
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden">
                {snapshot.deposits.map((deposit) => (
                  <div
                    key={deposit.transactionId}
                    className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/50 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {deposit.walletName}
                      </p>
                      {deposit.description && (
                        <p className="text-[10px] text-text-muted truncate max-w-56">
                          {deposit.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-success font-mono">
                        +{formatCurrency(deposit.amount)}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {formatDateTime(deposit.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
