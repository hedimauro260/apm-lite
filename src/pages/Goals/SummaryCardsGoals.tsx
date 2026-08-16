import type { ReactNode } from "react";
import {
  Clock,
  Flame,
  Target,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";
import { getStatusClasses, type GoalProgress } from "./goalLogic";

interface GoalSummaryCardProps {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  accent: string;
}

function GoalSummaryCard({ title, value, sub, icon, accent }: GoalSummaryCardProps) {
  return (
    <div className="card h-full p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{title}</p>
          <div className="mt-2 text-xl font-bold text-text-primary truncate">
            {value}
          </div>
        </div>
        <div className={cn("p-2 rounded-md shrink-0", accent)}>{icon}</div>
      </div>
      {sub && <div className="mt-3 text-xs">{sub}</div>}
    </div>
  );
}

export interface SummaryCardsGoalsProps {
  progress: GoalProgress | null;
}

export function SummaryCardsGoals({ progress }: SummaryCardsGoalsProps) {
  const hasActive = progress !== null;

  const weeklyGoal = progress?.totalWeeklyGoal ?? 0;
  const weeklyProgress = progress?.totalWeeklyProgress ?? 0;
  const remaining = progress?.remaining ?? 0;
  const excess = progress?.excess ?? 0;
  const percentage = progress?.percentage ?? 0;
  const status = progress?.status ?? "Not Started";
  const streak = progress?.streak ?? 0;
  const bestWallet = progress?.bestWallet ?? null;

  return (
    <section className="pb-4 border-b border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <GoalSummaryCard
          title="Weekly Goal"
          value={formatCurrency(weeklyGoal)}
          sub={<span className="text-text-muted">Weekly target</span>}
          icon={<Target className="h-4 w-4" />}
          accent="bg-primary/10 text-primary"
        />
        <GoalSummaryCard
          title="Weekly Progress"
          value={
            <span>
              {formatCurrency(weeklyProgress)}{" "}
              <span className="text-sm font-medium text-text-muted">
                / {formatCurrency(weeklyGoal)}
              </span>
            </span>
          }
          sub={
            hasActive ? (
              <span className="flex flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    getStatusClasses(status),
                  )}
                >
                  {status}
                </span>
                <span className="text-text-secondary">
                  {percentage.toFixed(1)}% of weekly goal
                </span>
              </span>
            ) : (
              <span className="text-text-secondary">
                {percentage.toFixed(1)}% of weekly goal
              </span>
            )
          }
          icon={<TrendingUp className="h-4 w-4" />}
          accent="bg-success/10 text-success"
        />
        <GoalSummaryCard
          title="Remaining"
          value={formatCurrency(remaining)}
          sub={
            hasActive && excess > 0 ? (
              <span className="text-success">
                +{formatCurrency(excess)} above goal
              </span>
            ) : hasActive ? (
              <span className="text-warning">left to reach weekly goal</span>
            ) : undefined
          }
          icon={<Clock className="h-4 w-4" />}
          accent="bg-warning/10 text-warning"
        />
        <GoalSummaryCard
          title="Best Wallet"
          value={
            hasActive && bestWallet ? bestWallet.walletName : "No deposits yet"
          }
          sub={
            hasActive && bestWallet ? (
              <span className="flex items-baseline gap-1">
                <span
                  className={
                    bestWallet.percentage >= 100
                      ? "text-success"
                      : bestWallet.percentage >= 60
                        ? "text-primary"
                        : "text-warning"
                  }
                >
                  {bestWallet.percentage.toFixed(1)}%{" "}
                  {formatCurrency(bestWallet.progress)}
                </span>
                <span className="text-text-muted">
                  / {formatCurrency(bestWallet.goal)}
                </span>
              </span>
            ) : undefined
          }
          icon={<WalletIcon className="h-4 w-4" />}
          accent="bg-surface-elevated text-text-secondary"
        />
        <GoalSummaryCard
          title="Current Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          sub={hasActive ? "consecutive days on target" : undefined}
          icon={<Flame className="h-4 w-4" />}
          accent="bg-danger/10 text-danger"
        />
      </div>
    </section>
  );
}
