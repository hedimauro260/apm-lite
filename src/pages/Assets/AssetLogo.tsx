import type { AssetEntity } from "../../types";

const FALLBACK_COLORS = [
  "#7C5CFC",
  "#22C55E",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

export function getAssetColor(asset: AssetEntity): string {
  if (asset.color) return asset.color;
  const sum = asset.symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[sum % FALLBACK_COLORS.length];
}

export function AssetLogo({
  asset,
  size = "md",
}: {
  asset: AssetEntity;
  size?: "sm" | "md" | "lg";
}) {
  const color = getAssetColor(asset);
  const sizeClass =
    size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";

  if (asset.logo) {
    return (
      <img
        src={asset.logo}
        alt={asset.name}
        className={`${sizeClass} rounded-full shrink-0 object-cover border border-border`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full shrink-0 flex items-center justify-center text-white font-bold border border-border`}
      style={{ backgroundColor: color }}
    >
      {asset.symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}