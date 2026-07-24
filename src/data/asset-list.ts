export interface PresetAsset {
  id: string;
  symbol: string;
  name: string;
  type: "crypto" | "stock" | "fiat" | "other";
  logo: string;
  defaultColor?: string;
}

export const PRESET_ASSETS: PresetAsset[] = [
  // Criptomoedas Principais
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    type: "crypto",
    logo: "/src/assets/logos/btc.webp",
    defaultColor: "#F7931A",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    type: "crypto",
    logo: "/src/assets/logos/ethereum.webp",
    defaultColor: "#627EEA",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    type: "crypto",
    logo: "/src/assets/logos/solana.webp",
    defaultColor: "#9945FF",
  },
  {
    id: "binance-coin",
    symbol: "BNB",
    name: "BNB",
    type: "crypto",
    logo: "/src/assets/logos/binance.webp",
    defaultColor: "#F3BA2F",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    type: "crypto",
    logo: "/src/assets/logos/cardano.webp",
    defaultColor: "#0033AD",
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    type: "crypto",
    logo: "/src/assets/logos/ripple.webp",
    defaultColor: "#23292F",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    type: "crypto",
    logo: "/src/assets/logos/doge.webp",
    defaultColor: "#C2A633",
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    type: "crypto",
    logo: "/src/assets/logos/polkadot.webp",
    defaultColor: "#E6007A",
  },
  {
    id: "avalanche",
    symbol: "AVAX",
    name: "Avalanche",
    type: "crypto",
    logo: "/src/assets/logos/avalanche.webp",
    defaultColor: "#E84142",
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    type: "crypto",
    logo: "/src/assets/logos/polygon.webp",
    defaultColor: "#8247E5",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    type: "crypto",
    logo: "/src/assets/logos/link.webp",
    defaultColor: "#2A5ADA",
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    type: "crypto",
    logo: "/src/assets/logos/ltc.webp",
    defaultColor: "#345D9D",
  },
  {
    id: "dash",
    symbol: "DASH",
    name: "Dash",
    type: "crypto",
    logo: "/src/assets/logos/dash.webp",
    defaultColor: "#8E44AD",
  },

  // Stablecoins
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    type: "crypto",
    logo: "/src/assets/logos/tether.webp",
    defaultColor: "#26A17B",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    type: "crypto",
    logo: "/src/assets/logos/usdc.webp",
    defaultColor: "#2775CA",
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    type: "crypto",
    logo: "/src/assets/logos/dai.webp",
    defaultColor: "#F4B731",
  },

  // Fiat
  {
    id: "usd",
    symbol: "USD",
    name: "US Dollar",
    type: "fiat",
    logo: "/src/assets/logos/usd.webp",
    defaultColor: "#22C55E",
  },
  {
    id: "eur",
    symbol: "EUR",
    name: "Euro",
    type: "fiat",
    logo: "/src/assets/logos/eur.webp",
    defaultColor: "#3B82F6",
  },
];

export function searchPresetAssets(query: string): PresetAsset[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return PRESET_ASSETS.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(lowerQuery) ||
      asset.name.toLowerCase().includes(lowerQuery),
  ).slice(0, 10); // Limita a 10 resultados
}
