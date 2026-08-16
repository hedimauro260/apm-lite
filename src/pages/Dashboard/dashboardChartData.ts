// src/pages/Dashboard/dashboardChartData.ts
import type { Transaction } from "../../types";

export interface DashboardSeriesPoint {
  label: string;
  value: number;
}

export interface DashboardSeries {
  balance: DashboardSeriesPoint[];
  inflows: DashboardSeriesPoint[];
  outflows: DashboardSeriesPoint[];
  transactions: DashboardSeriesPoint[];
}

const WEEKDAY_LABEL = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function toLocalDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDashboardSeries(
  transactions: Transaction[],
  days: number = 7,
): DashboardSeries {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byDay = new Map<
    string,
    { label: string; inflows: number; outflows: number; count: number }
  >();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = toLocalDateKey(day);
    byDay.set(key, { label: WEEKDAY_LABEL.format(day), inflows: 0, outflows: 0, count: 0 });
  }

  for (const t of transactions) {
    const bucket = byDay.get(toLocalDateKey(t.date));
    if (!bucket) continue;
    bucket.count += 1;
    if (t.type === "deposit") bucket.inflows += Math.abs(t.amount);
    else if (t.type === "withdraw") bucket.outflows += Math.abs(t.amount);
  }

  const balance: DashboardSeriesPoint[] = [];
  const inflows: DashboardSeriesPoint[] = [];
  const outflows: DashboardSeriesPoint[] = [];
  const transactionsSeries: DashboardSeriesPoint[] = [];
  let runningBalance = 0;

  for (const { label, inflows: inVal, outflows: outVal, count } of byDay.values()) {
    runningBalance += inVal - outVal;
    balance.push({ label, value: Number(runningBalance.toFixed(2)) });
    inflows.push({ label, value: Number(inVal.toFixed(2)) });
    outflows.push({ label, value: Number(outVal.toFixed(2)) });
    transactionsSeries.push({ label, value: count });
  }

  return {
    balance,
    inflows,
    outflows,
    transactions: transactionsSeries,
  };
}

export function weeklySums(series: DashboardSeries): {
  inflows: number;
  outflows: number;
  transactions: number;
} {
  return {
    inflows: series.inflows.reduce((sum, point) => sum + point.value, 0),
    outflows: series.outflows.reduce((sum, point) => sum + point.value, 0),
    transactions: series.transactions.reduce((sum, point) => sum + point.value, 0),
  };
}

export function variationFromSeries(series: { value: number }[]): number {
  if (series.length < 2) return 0;
  const previous = series[series.length - 2].value;
  const latest = series[series.length - 1].value;
  if (previous === 0) return 0;
  return Number((((latest - previous) / previous) * 100).toFixed(2));
}

export function trendFromVariation(
  value: number,
): "up" | "down" | "neutral" {
  return value > 0 ? "up" : value < 0 ? "down" : "neutral";
}