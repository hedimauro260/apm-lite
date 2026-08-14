// src/components/layout/Header/notificationTypes.ts
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowDownRight,
  CloudUpload,
  Target,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { Goal, Transaction, Wallet } from "../../../types";
import { computeGoalProgress } from "../../../pages/Goals/goalLogic";
import { computeWalletBalance, formatCurrency } from "../../../lib/utils";
import type { ToastType } from "../../ui/Toast";

export type NotificationType =
  | "deposit"
  | "goal"
  | "backup"
  | "failed"
  | "low_balance";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
}

const READ_KEY = "apm_read_notifications";
const LOW_BALANCE_THRESHOLD = 100;

export const NOTIFICATION_STYLES: Record<
  NotificationType,
  { icon: LucideIcon; iconClass: string; bgClass: string }
> = {
  deposit: { icon: ArrowDownRight, iconClass: "text-success", bgClass: "bg-success/10" },
  goal: { icon: Target, iconClass: "text-warning", bgClass: "bg-warning/10" },
  backup: { icon: CloudUpload, iconClass: "text-info", bgClass: "bg-info/10" },
  failed: { icon: XCircle, iconClass: "text-danger", bgClass: "bg-danger/10" },
  low_balance: { icon: AlertCircle, iconClass: "text-warning", bgClass: "bg-warning/10" },
};

export const NOTIFICATION_TOAST_TYPE: Record<NotificationType, ToastType> = {
  deposit: "success",
  goal: "warning",
  backup: "info",
  failed: "error",
  low_balance: "warning",
};

function walletNameOf(wallets: Wallet[], walletId: string): string {
  return wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";
}

function weekElapsed(startDate: string): number {
  const start = new Date(startDate).getTime();
  const diffDays = Math.floor((Date.now() - start) / (24 * 60 * 60 * 1000));
  return Math.max(0, Math.floor(diffDays / 7));
}

export function buildNotifications(
  transactions: Transaction[],
  goals: Goal[],
  wallets: Wallet[],
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date().toISOString();

  for (const t of transactions) {
    if (t.type === "deposit" && t.status === "completed") {
      notifications.push({
        id: `deposit:${t.id}`,
        type: "deposit",
        title: "Deposit complete",
        message: `${formatCurrency(Math.abs(t.amount))} · ${walletNameOf(wallets, t.walletId)}${
          t.description ? ` · ${t.description}` : ""
        }`,
        timestamp: t.date,
      });
    }
  }

  for (const t of transactions) {
    if (t.status === "failed") {
      notifications.push({
        id: `tx-failed:${t.id}`,
        type: "failed",
        title: "Transaction failed",
        message: `A ${t.type} transaction failed · ${walletNameOf(wallets, t.walletId)}${
          t.description ? ` · ${t.description}` : ""
        }`,
        timestamp: t.date,
      });
    }
  }

  for (const goal of goals) {
    if (goal.status !== "active") continue;
    try {
      const progress = computeGoalProgress(goal, transactions, wallets);
      if (progress.status === "Behind" || progress.status === "Not Started") {
        notifications.push({
          id: `goal:${goal.id}:${weekElapsed(goal.startDate)}`,
          type: "goal",
          title: "Goal target to fulfill",
          message: `${goal.name} is ${progress.percentage}% of its weekly goal — ${formatCurrency(
            progress.remaining,
          )} remaining.`,
          timestamp: now,
        });
      }
    } catch {
      // ignore malformed goals
    }
  }

  notifications.push({
    id: `backup:${format(new Date(), "yyyy-MM-dd")}`,
    type: "backup",
    title: "Backup reminder",
    message: "Back up your portfolio data to avoid losing it.",
    timestamp: now,
  });

  for (const wallet of wallets) {
    const balance = computeWalletBalance(wallet.id, transactions);
    if (wallet.status === "active" && balance <= LOW_BALANCE_THRESHOLD) {
      notifications.push({
        id: `wallet:${wallet.id}`,
        type: "low_balance",
        title: "Low wallet balance",
        message: `${wallet.name} balance is ${formatCurrency(balance)}.`,
        timestamp: now,
      });
    }
  }

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getReadNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveReadNotificationIds(ids: string[]): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable
  }
}
