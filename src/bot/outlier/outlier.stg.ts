export type OutlierConfig = {
  symbol: string;
  threshold: number; // % of differed from the start
};

export const OUTLIER_CONFIG: OutlierConfig[] = [
  { symbol: "kline.5.BTCUSDT", threshold: 1.5 },
  { symbol: "kline.5.ETHUSDT", threshold: 2 },
  { symbol: "kline.5.SOLUSDT", threshold: 2.5 },
  { symbol: "kline.5.XRPUSDT", threshold: 3 },
  { symbol: "kline.5.DOGEUSDT", threshold: 3.5 },
  { symbol: "kline.5.ADAUSDT", threshold: 4 },
  { symbol: "kline.5.DOTUSDT", threshold: 4 },
  { symbol: "kline.5.LINKUSDT", threshold: 4 },
  { symbol: "kline.5.AVAXUSDT", threshold: 4 },
  { symbol: "kline.5.APTUSDT", threshold: 4 },
];

export const OUTLIER_SYMBOLS: OutlierConfig["symbol"][] = OUTLIER_CONFIG.map(
  (config) => config.symbol,
);
