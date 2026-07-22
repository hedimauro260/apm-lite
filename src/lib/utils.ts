import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Asset } from "../types";

/**
 * Utility function to merge Tailwind CSS classes
 * Resolves conflicts between classes (e.g., px-2 px-4 -> px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency value to USD
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format percentage with sign
 */
export function formatPercentage(
  value: number,
  showSign: boolean = true,
): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Download file from data
 */
export function downloadFile(
  data: Blob | string,
  filename: string,
  type: string = "application/json",
): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get color for wallet type
 */
export function getWalletColor(type: string): string {
  const colors: Record<string, string> = {
    main: "text-blue-500 bg-blue-500/10",
    savings: "text-purple-500 bg-purple-500/10",
    trading: "text-amber-500 bg-amber-500/10",
    cold: "text-green-500 bg-green-500/10",
  };
  return colors[type] || "text-gray-500 bg-gray-500/10";
}

/**
 * Get color for crypto symbol
 */
export function getCryptoColor(symbol: string): string {
  const colors: Record<string, string> = {
    BTC: "text-orange-500",
    ETH: "text-blue-500",
    SOL: "text-purple-500",
    BNB: "text-yellow-500",
    ADA: "text-blue-700",
    XRP: "text-gray-700",
  };
  return colors[symbol.toUpperCase()] || "text-gray-400";
}

/**
 * Calculate change percentage
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format large numbers (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

export interface AggregatedAsset {
  symbol: string;
  name: string;
  totalQuantity: number;
  totalValue: number;
  walletCount: number;
  type: string;
}

export function aggregateAssetsBySymbol(assets: Asset[]): AggregatedAsset[] {
  const grouped = new Map<string, AggregatedAsset>();

  assets.forEach((asset) => {
    const existing = grouped.get(asset.symbol);

    if (existing) {
      existing.totalQuantity += asset.quantity;
      existing.totalValue += asset.currentValue;
      existing.walletCount += 1;
    } else {
      grouped.set(asset.symbol, {
        symbol: asset.symbol,
        name: asset.name,
        totalQuantity: asset.quantity,
        totalValue: asset.currentValue,
        walletCount: 1,
        type: asset.type,
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => b.totalValue - a.totalValue);
}