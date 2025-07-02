import type { Candle } from "@/type/trade.type";
import { candleChangeRatio } from "@/util/candle.util";

export function checkOutlierCandle(candle: Candle, threshold: number) {
  const changeRatio = candleChangeRatio(candle);
  return {
    changeRatio,
    isOutlier: Math.abs(changeRatio) > threshold,
  };
}
