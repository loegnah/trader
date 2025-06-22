import type { Candle } from "@/model/candle.model";
import { candleChangeRatio } from "@/util/candle.util";

export function checkOutlierCandle(candle: Candle, threshold: number) {
  const changeRatio = candleChangeRatio(candle) * 100;
  return {
    changeRatio,
    isOutlier: Math.abs(changeRatio) > threshold,
  };
}
