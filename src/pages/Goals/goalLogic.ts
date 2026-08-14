import { addDays, format, parseISO } from "date-fns";
import type {
  Goal,
  GoalDay,
  GoalProgressStatus,
  GoalSnapshot,
  GoalSnapshotBestWallet,
  GoalSnapshotDay,
  GoalSnapshotDeposit,
  GoalSnapshotWalletProgress,
  Transaction,
  Wallet,
} from "../../types";

export const GOAL_DAYS_COUNT = 7;

export interface GoalDayProgress {
  date: string;
  goal: number;
  current: number;
  percentage: number;
  status: GoalProgressStatus;
}

export interface GoalWalletDayProgress {
  date: string;
  goal: number;
  current: number;
  percentage: number;
  status: GoalProgressStatus;
}

export interface GoalWalletProgress {
  walletId: string;
  walletName: string;
  color?: string;
  weeklyGoal: number;
  weeklyProgress: number;
  percentage: number;
  status: GoalProgressStatus;
  days: GoalWalletDayProgress[];
}

export interface GoalBestWallet {
  walletId: string;
  walletName: string;
  percentage: number;
  progress: number;
  goal: number;
}

export interface GoalProgress {
  goal: Goal;
  days: GoalDayProgress[];
  totalWeeklyGoal: number;
  totalWeeklyProgress: number;
  remaining: number;
  excess: number;
  percentage: number;
  status: GoalProgressStatus;
  streak: number;
  bestWallet: GoalBestWallet | null;
  walletProgress: GoalWalletProgress[];
  deposits: GoalSnapshotDeposit[];
}

export function toDateKey(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function formatDayLabel(dateKey: string): string {
  return format(parseISO(dateKey), "EEE d");
}

export function formatDayRange(startDate: string, endDate: string): string {
  return `${formatDayLabel(startDate)} – ${formatDayLabel(endDate)}`;
}

export function buildGoalDays(startDate: string | Date): GoalDay[] {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  return Array.from({ length: GOAL_DAYS_COUNT }, (_, index) => ({
    date: toDateKey(addDays(start, index)),
    goal: 0,
  }));
}

export function splitWeeklyGoal(total: number): number[] {
  if (!isFinite(total) || total <= 0) {
    return Array.from({ length: GOAL_DAYS_COUNT }, () => 0);
  }
  const totalCents = Math.round(total * 100);
  const base = Math.floor(totalCents / GOAL_DAYS_COUNT);
  const remainder = totalCents - base * GOAL_DAYS_COUNT;
  return Array.from({ length: GOAL_DAYS_COUNT }, (_, index) =>
    (base + (index < remainder ? 1 : 0)) / 100,
  );
}

export function getGoalProgressStatus(percentage: number): GoalProgressStatus {
  if (percentage >= 100) return "Completed";
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "On Track";
  if (percentage >= 40) return "Behind";
  if (percentage >= 20) return "Getting Started";
  return "Not Started";
}

const STATUS_CLASSES: Record<GoalProgressStatus, string> = {
  "Not Started": "bg-surface-elevated text-text-muted",
  "Getting Started": "bg-blue-500/10 text-blue-500",
  Behind: "bg-warning/10 text-warning",
  "On Track": "bg-primary/10 text-primary",
  Excellent: "bg-success/10 text-success",
  Completed: "bg-success/10 text-success font-semibold",
};

export function getStatusClasses(status: GoalProgressStatus): string {
  return STATUS_CLASSES[status];
}

export function isEligibleDeposit(goal: Goal, transaction: Transaction): boolean {
  if (transaction.type !== "deposit") return false;
  if (transaction.countsTowardsGoals === false) return false;
  if (!goal.wallets.some((w) => w.walletId === transaction.walletId)) return false;
  const key = toDateKey(transaction.date);
  return key >= goal.startDate && key <= goal.endDate;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return round2((part / total) * 100);
}

export function computeGoalProgress(
  goal: Goal,
  transactions: Transaction[],
  wallets: Wallet[],
): GoalProgress {
  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";
  const walletColor = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.color;

  const eligible = transactions.filter((t) => isEligibleDeposit(goal, t));

  const deposits: GoalSnapshotDeposit[] = eligible
    .map((t) => ({
      transactionId: t.id,
      amount: Math.abs(t.amount),
      date: t.date,
      walletName: walletName(t.walletId),
      description: t.description,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const walletConfigs = goal.wallets ?? [];

  const walletProgress: GoalWalletProgress[] = walletConfigs.map((config) => {
    const days: GoalWalletDayProgress[] = config.days.map((day) => {
      const current = round2(
        eligible
          .filter(
            (t) =>
              t.walletId === config.walletId && toDateKey(t.date) === day.date,
          )
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      );
      const pct = day.goal > 0 ? percentage(current, day.goal) : 0;
      return {
        date: day.date,
        goal: day.goal,
        current,
        percentage: pct,
        status: getGoalProgressStatus(pct),
      };
    });
    const weeklyProgress = round2(
      days.reduce((sum, day) => sum + day.current, 0),
    );
    const walletPct = percentage(weeklyProgress, config.weeklyGoal);
    return {
      walletId: config.walletId,
      walletName: walletName(config.walletId),
      color: walletColor(config.walletId),
      weeklyGoal: config.weeklyGoal,
      weeklyProgress,
      percentage: walletPct,
      status: getGoalProgressStatus(walletPct),
      days,
    };
  });

  const days: GoalDayProgress[] = buildGoalDays(goal.startDate).map(
    (day, index) => {
      const goalValue = round2(
        walletProgress.reduce(
          (sum, wallet) => sum + (wallet.days[index]?.goal ?? 0),
          0,
        ),
      );
      const current = round2(
        walletProgress.reduce(
          (sum, wallet) => sum + (wallet.days[index]?.current ?? 0),
          0,
        ),
      );
      const pct = goalValue > 0 ? percentage(current, goalValue) : 0;
      return {
        date: day.date,
        goal: goalValue,
        current,
        percentage: pct,
        status: getGoalProgressStatus(pct),
      };
    },
  );

  const totalWeeklyProgress = round2(
    walletProgress.reduce((sum, wallet) => sum + wallet.weeklyProgress, 0),
  );
  const totalWeeklyGoal = goal.totalWeeklyGoal;
  const pct = percentage(totalWeeklyProgress, totalWeeklyGoal);
  const remaining = Math.max(0, round2(totalWeeklyGoal - totalWeeklyProgress));
  const excess = Math.max(0, round2(totalWeeklyProgress - totalWeeklyGoal));

  let streak = 0;
  for (const day of days) {
    if (day.current >= day.goal) streak += 1;
    else break;
  }

  let bestWallet: GoalBestWallet | null = null;
  const withProgress = walletProgress.filter((w) => w.weeklyProgress > 0);
  if (withProgress.length > 0) {
    const best = withProgress.reduce((a, b) =>
      b.percentage > a.percentage ||
      (b.percentage === a.percentage && b.weeklyProgress > a.weeklyProgress)
        ? b
        : a,
    );
    bestWallet = {
      walletId: best.walletId,
      walletName: best.walletName,
      percentage: best.percentage,
      progress: best.weeklyProgress,
      goal: best.weeklyGoal,
    };
  }

  return {
    goal,
    days,
    totalWeeklyGoal,
    totalWeeklyProgress,
    remaining,
    excess,
    percentage: pct,
    status: getGoalProgressStatus(pct),
    streak,
    bestWallet,
    walletProgress,
    deposits,
  };
}

export function buildGoalSnapshot(progress: GoalProgress): GoalSnapshot {
  return {
    archivedAt: new Date().toISOString(),
    totalWeeklyGoal: progress.totalWeeklyGoal,
    totalWeeklyProgress: progress.totalWeeklyProgress,
    remaining: progress.remaining,
    percentage: progress.percentage,
    status: progress.status,
    streak: progress.streak,
    bestWallet: progress.bestWallet
      ? {
          walletId: progress.bestWallet.walletId,
          walletName: progress.bestWallet.walletName,
          percentage: progress.bestWallet.percentage,
          progress: progress.bestWallet.progress,
          goal: progress.bestWallet.goal,
        }
      : null,
    walletProgress: progress.walletProgress.map<GoalSnapshotWalletProgress>(
      (w) => ({
        walletId: w.walletId,
        walletName: w.walletName,
        color: w.color,
        weeklyGoal: w.weeklyGoal,
        weeklyProgress: w.weeklyProgress,
        percentage: w.percentage,
        status: w.status,
        days: w.days.map<GoalSnapshotDay>((d) => ({
          date: d.date,
          goal: d.goal,
          current: d.current,
          percentage: d.percentage,
          status: d.status,
        })),
      }),
    ),
    days: progress.days.map<GoalSnapshotDay>((d) => ({
      date: d.date,
      goal: d.goal,
      current: d.current,
      percentage: d.percentage,
      status: d.status,
    })),
    deposits: progress.deposits,
  };
}

export function getSnapshotBestWallet(
  snapshot: GoalSnapshot,
): GoalSnapshotBestWallet | null {
  return snapshot.bestWallet;
}

export function walletDisplayName(
  walletId: string,
  wallets: Wallet[],
): string {
  return wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";
}
