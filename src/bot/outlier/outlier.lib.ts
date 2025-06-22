import type { Candle } from "@/model/candle.model";
import { candleChangeRatio } from "@/util/candle.util";

export function checkOutlierCandle(candle: Candle, threshold: number) {
  const changed = candleChangeRatio(candle) * 100;
  return { changed, isOutlier: Math.abs(changed) > threshold };
}
