import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatTime,
  formatCompactNumber,
  formatQuantity,
} from "./utils/format";

export {
  truncate,
  getInitials,
  isEmpty,
  safeJsonParse,
  debounce,
} from "./utils/string";

export {
  calculatePercentage,
  clamp,
  calculateChange,
  generateId,
  sleep,
} from "./utils/math";

export { downloadFile, copyToClipboard } from "./utils/dom";

export { getWalletColor, getCryptoColor } from "./utils/colors";

export { aggregateAssetsBySymbol, type AggregatedAsset } from "./utils/asset";

export { computeWalletBalance, withWalletBalances } from "./utils/wallets";

/*
 ** exportar as constantes
 */
export * from "./constants";

/*
 ** exportar as utilidades
 */
export * from "./utility";
