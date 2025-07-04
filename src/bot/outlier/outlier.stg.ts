export type OutlierConfig = {
  threshold: number;
  step: number;
};

const OUTLIER_CONFIG_RAW_LIST: any[] = [
  ["kline.5.BTCUSDT", 0.01, 0.002],
  ["kline.5.ETHUSDT", 0.02, 0.003],
  ["kline.5.SOLUSDT", 0.02, 0.003],
  ["kline.5.XRPUSDT"],
  ["kline.5.LTCUSDT"],
  ["kline.5.DOGEUSDT"],
  ["kline.5.TRXUSDT"],
  ["kline.5.ADAUSDT"],
  ["kline.5.DOTUSDT"],
  ["kline.5.LINKUSDT"],
  ["kline.5.AVAXUSDT"],
  ["kline.5.APTUSDT"],
];

export const OUTLIER_CONFIG_LIST: [string, OutlierConfig][] =
  OUTLIER_CONFIG_RAW_LIST.map(([topic, threshold, step]) => {
    return [
      topic,
      {
        threshold: threshold ?? 0.025,
        step: step ?? 0.004,
      },
    ];
  });

export const OUTLIER_TOPICS: string[] = OUTLIER_CONFIG_LIST.map(
  ([topic]) => topic,
);
