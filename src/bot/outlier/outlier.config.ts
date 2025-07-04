export enum OutlierPhase {}

const TARGET_RAW_DATA: any[] = [
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

type TargetStg = {
  threshold: number;
  step: number;
};

const THRESHOLD_DEFAULT = 0.025;
const STEP_DEFAULT = 0.004;

export class OutlierConfig {
  targetTopics: string[] = TARGET_RAW_DATA.map(([topic]) => topic);
  targetStgMap = TARGET_RAW_DATA.reduce(
    (acc, [topic, threshold, step]) => {
      acc[topic] = {
        threshold: threshold ?? THRESHOLD_DEFAULT,
        step: step ?? STEP_DEFAULT,
      };
      return acc;
    },
    {} as { [key in string]: TargetStg },
  );
}
