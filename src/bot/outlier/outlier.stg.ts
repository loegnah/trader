export type OutlierConfig = {
  threshold: number;
};
export const OUTLIER_CONFIG_LIST: [string, OutlierConfig][] = [
  ["kline.5.BTCUSDT", { threshold: 1.5 }],
  ["kline.5.ETHUSDT", { threshold: 2 }],
  ["kline.5.SOLUSDT", { threshold: 2.5 }],
  ["kline.5.XRPUSDT", { threshold: 3 }],
  ["kline.5.LTCUSDT", { threshold: 3 }],
  ["kline.5.DOGEUSDT", { threshold: 3.5 }],
  ["kline.5.TRXUSDT", { threshold: 3.5 }],
  ["kline.5.ADAUSDT", { threshold: 4 }],
  ["kline.5.DOTUSDT", { threshold: 4 }],
  ["kline.5.LINKUSDT", { threshold: 4 }],
  ["kline.5.AVAXUSDT", { threshold: 4 }],
  ["kline.5.APTUSDT", { threshold: 4 }],
];

export const OUTLIER_SYMBOLS: string[] = OUTLIER_CONFIG_LIST.map(
  ([symbol]) => symbol,
);
