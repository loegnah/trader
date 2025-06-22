export type OutlierConfig = {
  threshold: number;
  step: number;
};

const OUTLIER_CONFIG_RAW_LIST: any[] = [
  ["kline.5.BTCUSDT", 1, 0.2],
  ["kline.5.ETHUSDT", 2, 0.3],
  ["kline.5.SOLUSDT", 2, 0.3],
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
        threshold: threshold ?? 2.5,
        step: step ?? 0.4,
      },
    ];
  });

export const OUTLIER_TOPICS: string[] = OUTLIER_CONFIG_LIST.map(
  ([topic]) => topic,
);
