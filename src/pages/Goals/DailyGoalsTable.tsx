import { CalendarCheck2, Target } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { cn, formatCurrency } from "../../lib/utils";
import {
  formatDayLabel,
  getStatusClasses,
  type GoalProgress,
} from "./goalLogic";

export interface DailyGoalsTableProps {
  progress: GoalProgress | null;
  onFinishWeek: () => void;
  onCreateGoal: () => void;
}

function ProgressBar({ percentage }: { percentage: number }) {
  const capped = Math.min(100, Math.max(0, percentage));
  const barClass =
    percentage >= 100
      ? "bg-success"
      : percentage >= 60
        ? "bg-primary"
        : percentage >= 40
          ? "bg-warning"
          : percentage > 0
            ? "bg-blue-500"
            : "bg-surface-elevated";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 min-w-16 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${capped}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-text-primary tabular-nums">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}

export function DailyGoalsTable({
  progress,
  onFinishWeek,
  onCreateGoal,
}: DailyGoalsTableProps) {
  if (!progress) {
    return (
      <section className="card flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4 text-text-muted" />
            <h2 className="text-xs font-semibold text-text-primary">
              Daily Goals
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              No Active Goal
            </p>
            <p className="mt-1 text-xs text-text-muted max-w-sm">
              You don&apos;t have any active weekly goals. Create a new goal to
              start tracking your deposit progress.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onCreateGoal}>
            Create your first goal
          </Button>
        </div>
      </section>
    );
  }

  const { goal } = progress;
  const walletProgress = progress.walletProgress;
  const dayDates = walletProgress[0]?.days.map((day) => day.date) ?? [];

  return (
    <section className="card flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarCheck2 className="h-4 w-4 text-text-muted shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-text-primary truncate">
              Daily Goals
            </h2>
            <p className="text-[10px] text-text-muted truncate">
              {goal.name} ·{" "}
              {formatDayLabel(goal.startDate)} –{" "}
              {formatDayLabel(goal.endDate)}
            </p>
          </div>
        </div>
        <div className="sm:ml-auto">
          <Button variant="secondary" size="sm" onClick={onFinishWeek}>
            Finish Week
          </Button>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-340">
          <thead>
            <tr className="border-b border-border bg-surface-elevated">
              {[
                "Wallet",
                "Weekly Goal",
                ...dayDates.map((date) => formatDayLabel(date)),
                "Current",
                "Progress",
                "Status",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {walletProgress.map((wallet) => (
              <tr key={wallet.walletId} className="align-top">
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    {wallet.color && (
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: wallet.color }}
                      />
                    )}
                    <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                      {wallet.walletName}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <span className="text-sm font-semibold text-text-primary font-mono whitespace-nowrap">
                    {formatCurrency(wallet.weeklyGoal)}
                  </span>
                </td>

                {wallet.days.map((day) => (
                  <td key={day.date} className="px-3 py-4">
                    <span className="text-xs font-semibold text-text-primary font-mono whitespace-nowrap">
                      {formatCurrency(day.current)}
                    </span>
                    <span className="ml-1 text-[10px] text-text-muted font-mono whitespace-nowrap">
                      / {formatCurrency(day.goal)}
                    </span>
                  </td>
                ))}

                <td className="px-3 py-4">
                  <span className="text-sm font-semibold text-text-primary font-mono whitespace-nowrap">
                    {formatCurrency(wallet.weeklyProgress)}
                  </span>
                </td>

                <td className="px-3 py-4 w-52">
                  <ProgressBar percentage={wallet.percentage} />
                </td>

                <td className="px-3 py-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap",
                      getStatusClasses(wallet.status),
                    )}
                  >
                    {wallet.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
